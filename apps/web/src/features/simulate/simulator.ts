import type { RFNode, RFEdge } from "@/features/canvas/store/diagram-store";
import type { NodeType } from "@archlet/shared";
import { getCapacity } from "./capacity";
import type { Packet } from "./packet";

const PACKET_SPEED = 0.5; // traversal time ~2 seconds
const METRICS_WINDOW_MS = 3000;
const MAX_PACKETS = 300;

type EdgeMetric = { count: number; window: number[] };
type NodeMetric = { arrivals: number[]; capacity: number };

export type SimSnapshot = {
  edgeMetrics: Record<string, number>; // req/s
  nodeMetrics: Record<string, { arrivalRate: number; util: number }>;
};

export class Simulator {
  private nodes: RFNode[];
  private edges: RFEdge[];
  private outgoing: Map<string, string[]>;
  private edgeTarget: Map<string, string>; // edgeId -> targetNodeId
  private packets: Packet[] = [];
  private edgeMetrics: Map<string, EdgeMetric> = new Map();
  private nodeMetrics: Map<string, NodeMetric> = new Map();
  private emitAccumulators: Map<string, number> = new Map();
  private rafId: number | null = null;
  private lastTs: number | null = null;
  private deadNodeIds: Set<string> = new Set();
  running = false;

  private onSnapshot: (snap: SimSnapshot) => void;

  constructor(
    nodes: RFNode[],
    edges: RFEdge[],
    onSnapshot: (snap: SimSnapshot) => void
  ) {
    this.nodes = nodes;
    this.edges = edges;
    this.onSnapshot = onSnapshot;
    this.outgoing = new Map();
    this.edgeTarget = new Map();

    // Build adjacency
    for (const node of nodes) {
      this.outgoing.set(node.id, []);
    }
    for (const edge of edges) {
      const list = this.outgoing.get(edge.source) ?? [];
      list.push(edge.id);
      this.outgoing.set(edge.source, list);
      this.edgeTarget.set(edge.id, edge.target);
    }

    // Pre-populate node capacity
    for (const node of nodes) {
      const type = node.type as NodeType;
      const variant = (node.data.variant as string) ?? "";
      const config = (node.data.config as Record<string, unknown>) ?? {};
      const capacity = getCapacity(type, variant, config);
      this.nodeMetrics.set(node.id, { arrivals: [], capacity });
    }
  }

  /** Update the set of dead (killed) nodes — called from failure-mode hook */
  setDeadNodes(ids: Set<string>) {
    this.deadNodeIds = new Set(ids);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTs = null;
    this.rafId = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  reset() {
    this.stop();
    this.packets = [];
    this.edgeMetrics.clear();
    this.nodeMetrics.clear();
    this.emitAccumulators.clear();
    // Re-init node capacities
    for (const node of this.nodes) {
      const type = node.type as NodeType;
      const variant = (node.data.variant as string) ?? "";
      const config = (node.data.config as Record<string, unknown>) ?? {};
      const capacity = getCapacity(type, variant, config);
      this.nodeMetrics.set(node.id, { arrivals: [], capacity });
    }
    this.onSnapshot(this.buildSnapshot());
  }

  private loop = (ts: number) => {
    if (!this.running) return;
    if (this.lastTs === null) this.lastTs = ts;
    const dt = Math.min((ts - this.lastTs) / 1000, 0.1); // cap dt at 100ms
    this.lastTs = ts;

    this.tick(dt);
    this.rafId = requestAnimationFrame(this.loop);
  };

  tick(dt: number) {
    const now = Date.now();

    // Emit packets from User nodes (skip dead ones)
    for (const node of this.nodes) {
      if (node.type !== "user") continue;
      if (this.deadNodeIds.has(node.id)) continue;
      const config = (node.data.config as Record<string, unknown>) ?? {};
      const reqPerSec = typeof config["reqPerSec"] === "number" ? config["reqPerSec"] : 10;
      const outEdges = this.outgoing.get(node.id) ?? [];
      if (outEdges.length === 0) continue;

      const acc = this.emitAccumulators.get(node.id) ?? 0;
      const newAcc = acc + reqPerSec * dt;
      const toEmit = Math.floor(newAcc);
      this.emitAccumulators.set(node.id, newAcc - toEmit);

      for (let i = 0; i < toEmit; i++) {
        if (this.packets.length >= MAX_PACKETS) break;
        // Distribute across outgoing edges round-robin style
        const edgeId = outEdges[i % outEdges.length]!;
        this.spawnPacket(edgeId, now);
      }
    }

    // Move packets
    const completed: Packet[] = [];
    const active: Packet[] = [];
    for (const p of this.packets) {
      const next = { ...p, progress: p.progress + p.speed * dt };
      if (next.progress >= 1) {
        completed.push(next);
      } else {
        active.push(next);
      }
    }

    // Handle completions: log metrics + fork
    for (const p of completed) {
      // Edge metric
      const em = this.edgeMetrics.get(p.edgeId) ?? { count: 0, window: [] };
      em.count++;
      em.window.push(now);
      this.edgeMetrics.set(p.edgeId, em);

      // Node arrival
      const targetId = this.edgeTarget.get(p.edgeId);
      if (targetId) {
        // Drop packet if target is a dead node — don't log arrival or fork
        if (this.deadNodeIds.has(targetId)) continue;

        const nm = this.nodeMetrics.get(targetId) ?? { arrivals: [], capacity: 1000 };
        nm.arrivals.push(now);
        this.nodeMetrics.set(targetId, nm);

        // Fork to outgoing edges of target
        const outEdges = this.outgoing.get(targetId) ?? [];
        for (const eid of outEdges) {
          if (active.length >= MAX_PACKETS) break;
          active.push(this.makePacket(eid, now));
        }
      }
    }

    this.packets = active;

    // Prune stale metrics
    const cutoff = now - METRICS_WINDOW_MS;
    for (const [, em] of this.edgeMetrics) {
      em.window = em.window.filter((t) => t > cutoff);
    }
    for (const [, nm] of this.nodeMetrics) {
      nm.arrivals = nm.arrivals.filter((t) => t > cutoff);
    }

    this.onSnapshot(this.buildSnapshot());
  }

  private spawnPacket(edgeId: string, now: number) {
    this.packets.push(this.makePacket(edgeId, now));
  }

  private makePacket(edgeId: string, now: number): Packet {
    return {
      id: `pkt-${now}-${Math.random().toString(36).slice(2, 7)}`,
      edgeId,
      progress: 0,
      speed: PACKET_SPEED,
      bornAt: now,
    };
  }

  private buildSnapshot(): SimSnapshot {
    const windowSec = METRICS_WINDOW_MS / 1000;
    const edgeMetrics: Record<string, number> = {};
    for (const [eid, em] of this.edgeMetrics) {
      edgeMetrics[eid] = em.window.length / windowSec;
    }
    const nodeMetrics: Record<string, { arrivalRate: number; util: number }> = {};
    for (const [nid, nm] of this.nodeMetrics) {
      const arrivalRate = nm.arrivals.length / windowSec;
      const util = nm.capacity === Infinity ? 0 : arrivalRate / nm.capacity;
      nodeMetrics[nid] = { arrivalRate, util };
    }
    return { edgeMetrics, nodeMetrics };
  }

  getPackets(): Packet[] {
    return this.packets;
  }
}
