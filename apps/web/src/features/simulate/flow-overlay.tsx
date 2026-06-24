import React, { useEffect, useRef, useCallback } from "react";
import { useDiagramStore } from "@/features/canvas/store/diagram-store";
import { useSimStore } from "./sim-store";
import { useSimulate } from "./use-simulate";
import type { Packet } from "./packet";

const MAX_RENDER_PACKETS = 300;
const SVG_NS = "http://www.w3.org/2000/svg";

function getEdgePath(edgeId: string): SVGPathElement | null {
  return document.querySelector<SVGPathElement>(
    `.react-flow__edge[data-id="${edgeId}"] .react-flow__edge-path`
  );
}

function getContainerRect(containerRef: React.RefObject<HTMLDivElement | null>): DOMRect | null {
  return containerRef.current ? containerRef.current.getBoundingClientRect() : null;
}

type PacketDot = { x: number; y: number; id: string };
type EdgeBadge = { x: number; y: number; label: string; edgeId: string };

export const FlowOverlay = React.memo(function FlowOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const layerRef = useRef<SVGGElement>(null);
  const htmlLayerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const { isRunning, getSim } = useSimulate();
  const edgeMetrics = useSimStore((s) => s.edgeMetrics);
  const nodeMetrics = useSimStore((s) => s.nodeMetrics);
  const edges = useDiagramStore((s) => s.edges);

  // Mark edges that have traffic, so xyflow edge-path picks up the flowing class
  useEffect(() => {
    const active = new Set<string>();
    for (const edge of edges) {
      if ((edgeMetrics[edge.id] ?? 0) > 0) active.add(edge.id);
    }
    document.querySelectorAll<HTMLElement>(".react-flow__edge").forEach((el) => {
      const id = el.getAttribute("data-id");
      if (id && active.has(id)) el.classList.add("archlet-edge-active");
      else el.classList.remove("archlet-edge-active");
    });
  }, [edgeMetrics, edges, nodeMetrics]);

  const draw = useCallback(() => {
    const svg = svgRef.current;
    const layer = layerRef.current;
    const htmlLayer = htmlLayerRef.current;
    if (!svg || !layer) return;
    const containerRect = getContainerRect(containerRef);
    if (!containerRect) return;

    // Collect packets from the live module-level simulator
    const allPackets: Packet[] = getSim()?.getPackets() ?? [];
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
        // path not yet in DOM
      }
    }

    // Edge throughput badges (only when running or has metrics)
    const edgeBadges: EdgeBadge[] = [];
    for (const edge of edges) {
      const rps = edgeMetrics[edge.id];
      if (!rps && !isRunning) continue;
      if (rps === 0 || rps == null) continue;
      const path = getEdgePath(edge.id);
      if (!path) continue;
      try {
        const len = path.getTotalLength();
        const pt = path.getPointAtLength(len * 0.5);
        const ctm = path.getScreenCTM();
        if (!ctm) continue;
        const sx = ctm.a * pt.x + ctm.c * pt.y + ctm.e - containerRect.left;
        const sy = ctm.b * pt.x + ctm.d * pt.y + ctm.f - containerRect.top;
        edgeBadges.push({ x: sx, y: sy + 18, label: `${Math.round(rps)} req/s`, edgeId: edge.id });
      } catch {
        // skip
      }
    }

    // Clear dynamic layer only (defs stay)
    layer.innerHTML = "";

    // Packet dots: glow circle (large soft amber) + core dot
    for (const d of dots) {
      const glow = document.createElementNS(SVG_NS, "circle");
      glow.setAttribute("cx", String(d.x));
      glow.setAttribute("cy", String(d.y));
      glow.setAttribute("r", "10");
      glow.setAttribute("fill", "url(#packet-glow)");
      glow.setAttribute("opacity", "0.55");
      layer.appendChild(glow);

      const core = document.createElementNS(SVG_NS, "circle");
      core.setAttribute("cx", String(d.x));
      core.setAttribute("cy", String(d.y));
      core.setAttribute("r", "4.5");
      core.setAttribute("fill", "url(#packet-core)");
      core.setAttribute("filter", "url(#packet-blur)");
      layer.appendChild(core);
    }

    // Edge throughput badges — HTML overlay for crisp typography.
    if (htmlLayer) {
      htmlLayer.innerHTML = "";
      for (const b of edgeBadges) {
        const div = document.createElement("div");
        div.style.position = "absolute";
        div.style.left = `${b.x}px`;
        div.style.top = `${b.y}px`;
        div.style.transform = "translate(-50%, -50%)";
        div.className =
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold tracking-tight " +
          "bg-cream-50/95 dark:bg-plum-900/85 border border-amber-300 dark:border-amber-400/40 " +
          "text-amber-700 dark:text-amber-300 shadow-soft backdrop-blur-sm whitespace-nowrap";
        div.innerHTML =
          `<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>` +
          `<span>${b.label}</span>`;
        htmlLayer.appendChild(div);
      }
    }
  }, [isRunning, edgeMetrics, edges, getSim]);

  // Hold the latest draw in a ref so the rAF loop never has to restart.
  const drawRef = useRef(draw);
  drawRef.current = draw;

  // rAF loop — started once, runs forever until unmount.
  useEffect(() => {
    const loop = () => {
      drawRef.current();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Always render the SVG so refs are always attached; draw() handles idle state by clearing layer.
  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5 }}
    >
      <svg
        ref={svgRef}
        data-archlet-flow-overlay="true"
        style={{ width: "100%", height: "100%", overflow: "visible" }}
        aria-hidden="true"
      >
        <defs>
          {/* Packet core: radial amber gradient */}
          <radialGradient id="packet-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF3C7" stopOpacity="1" />
            <stop offset="55%" stopColor="#F59E0B" stopOpacity="1" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0.95" />
          </radialGradient>
          {/* Packet outer glow: soft falloff to transparent */}
          <radialGradient id="packet-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FBB525" stopOpacity="0.7" />
            <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
          {/* Subtle blur on packet core */}
          <filter id="packet-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.4" />
          </filter>
          {/* Drop shadow for throughput pill */}
          <filter id="pill-shadow" x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#36114a" floodOpacity="0.18" />
          </filter>
        </defs>
        <g ref={layerRef} />
      </svg>
      <div ref={htmlLayerRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
    </div>
  );
});
