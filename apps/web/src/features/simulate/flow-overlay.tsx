import React, { useEffect, useRef, useCallback } from "react";
import { useDiagramStore } from "@/features/canvas/store/diagram-store";
import { useSimStore } from "./sim-store";
import { useSimulate } from "./use-simulate";
import type { Packet } from "./packet";

const MAX_RENDER_PACKETS = 300;

function getEdgePath(edgeId: string): SVGPathElement | null {
  return document.querySelector<SVGPathElement>(
    `.react-flow__edge[data-id="${edgeId}"] .react-flow__edge-path`
  );
}

function getNodeRect(nodeId: string): DOMRect | null {
  const el = document.querySelector<HTMLElement>(
    `.react-flow__node[data-id="${nodeId}"]`
  );
  return el ? el.getBoundingClientRect() : null;
}

function getContainerRect(containerRef: React.RefObject<HTMLDivElement | null>): DOMRect | null {
  return containerRef.current ? containerRef.current.getBoundingClientRect() : null;
}

type PacketDot = { x: number; y: number; id: string };
type EdgeBadge = { x: number; y: number; label: string; edgeId: string };
type NodeBadge = { x: number; y: number; util: number; nodeId: string };

function utilColor(util: number): string {
  if (util > 0.8) return "#EF4444"; // red
  if (util > 0.5) return "#F59E0B"; // amber
  return "#22C55E";                  // green
}

export const FlowOverlay = React.memo(function FlowOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const rafRef = useRef<number | null>(null);
  const { isRunning, simRef } = useSimulate();
  const edgeMetrics = useSimStore((s) => s.edgeMetrics);
  const nodeMetrics = useSimStore((s) => s.nodeMetrics);
  const nodes = useDiagramStore((s) => s.nodes);
  const edges = useDiagramStore((s) => s.edges);

  const draw = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const containerRect = getContainerRect(containerRef);
    if (!containerRect) return;

    // Collect packets from simulator
    const allPackets: Packet[] = simRef.current?.getPackets() ?? [];
    const packets = allPackets.length > MAX_RENDER_PACKETS
      ? allPackets.filter((_, i) => i % Math.ceil(allPackets.length / MAX_RENDER_PACKETS) === 0)
      : allPackets;

    const dots: PacketDot[] = [];
    for (const p of packets) {
      const path = getEdgePath(p.edgeId);
      if (!path) continue;
      try {
        const len = path.getTotalLength();
        const pt = path.getPointAtLength(p.progress * len);
        const ctm = path.getScreenCTM();
        if (!ctm) continue;
        const sx = ctm.a * pt.x + ctm.c * pt.y + ctm.e - containerRect.left;
        const sy = ctm.b * pt.x + ctm.d * pt.y + ctm.f - containerRect.top;
        dots.push({ x: sx, y: sy, id: p.id });
      } catch {
        // path not yet in DOM — skip
      }
    }

    // Edge throughput badges
    const edgeBadges: EdgeBadge[] = [];
    for (const edge of edges) {
      const rps = edgeMetrics[edge.id];
      if (!rps && !isRunning) continue;
      const path = getEdgePath(edge.id);
      if (!path) continue;
      try {
        const len = path.getTotalLength();
        const pt = path.getPointAtLength(len * 0.5);
        const ctm = path.getScreenCTM();
        if (!ctm) continue;
        const sx = ctm.a * pt.x + ctm.c * pt.y + ctm.e - containerRect.left;
        const sy = ctm.b * pt.x + ctm.d * pt.y + ctm.f - containerRect.top;
        const label = rps != null ? `${Math.round(rps)}req/s` : "0req/s";
        edgeBadges.push({ x: sx, y: sy + 16, label, edgeId: edge.id });
      } catch {
        // skip
      }
    }

    // Node util badges
    const nodeBadges: NodeBadge[] = [];
    for (const node of nodes) {
      if (node.type === "user") continue;
      const metric = nodeMetrics[node.id];
      if (!metric && !isRunning) continue;
      const rect = getNodeRect(node.id);
      if (!rect) continue;
      const x = rect.right - containerRect.left - 4;
      const y = rect.top - containerRect.top - 4;
      nodeBadges.push({ x, y, util: metric?.util ?? 0, nodeId: node.id });
    }

    // Build SVG content
    svg.innerHTML = "";

    // Packet dots
    for (const d of dots) {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", String(d.x));
      circle.setAttribute("cy", String(d.y));
      circle.setAttribute("r", "4");
      circle.setAttribute("fill", "#F59E0B");
      circle.setAttribute("opacity", "0.9");
      svg.appendChild(circle);
    }

    // Edge badges
    for (const b of edgeBadges) {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textEl.setAttribute("x", String(b.x));
      textEl.setAttribute("y", String(b.y));
      textEl.setAttribute("text-anchor", "middle");
      textEl.setAttribute("font-size", "10");
      textEl.setAttribute("font-family", "ui-sans-serif, system-ui, sans-serif");
      textEl.setAttribute("font-weight", "600");
      textEl.setAttribute("fill", "#92400E");
      textEl.setAttribute("paint-order", "stroke");
      textEl.setAttribute("stroke", "white");
      textEl.setAttribute("stroke-width", "3");
      textEl.setAttribute("stroke-linejoin", "round");
      textEl.textContent = b.label;
      g.appendChild(textEl);
      svg.appendChild(g);
    }

    // Node util badges
    for (const b of nodeBadges) {
      const color = utilColor(b.util);
      const pct = `${Math.round(b.util * 100)}%`;
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", String(b.x - 20));
      rect.setAttribute("y", String(b.y - 12));
      rect.setAttribute("width", "24");
      rect.setAttribute("height", "14");
      rect.setAttribute("rx", "7");
      rect.setAttribute("fill", color);
      rect.setAttribute("opacity", "0.9");

      const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textEl.setAttribute("x", String(b.x - 8));
      textEl.setAttribute("y", String(b.y - 2));
      textEl.setAttribute("text-anchor", "middle");
      textEl.setAttribute("font-size", "9");
      textEl.setAttribute("font-family", "ui-sans-serif, system-ui, sans-serif");
      textEl.setAttribute("font-weight", "700");
      textEl.setAttribute("fill", "white");
      textEl.textContent = pct;

      g.appendChild(rect);
      g.appendChild(textEl);
      svg.appendChild(g);
    }
  }, [isRunning, edgeMetrics, nodeMetrics, nodes, edges, simRef]);

  // rAF loop independent of simulator tick
  useEffect(() => {
    const loop = () => {
      draw();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  if (!isRunning && Object.keys(edgeMetrics).length === 0) return null;

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5 }}
    >
      <svg
        ref={svgRef}
        style={{ width: "100%", height: "100%", overflow: "visible" }}
        aria-hidden="true"
      />
    </div>
  );
});
