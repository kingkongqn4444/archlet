import React, { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  useReactFlow,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useDiagramStore } from "./store/diagram-store";
import { nodeTypes as customNodeTypes } from "./nodes";
import { edgeTypes } from "./edges/labeled-edge";
import { SidePalette } from "./toolbar/side-palette";
import { TopToolbar } from "./toolbar/top-toolbar";
import { LevelSwitcher } from "./toolbar/level-switcher";
import { useKeyboard } from "./hooks/use-keyboard";
import { PropertiesPanel } from "./properties/properties-panel";
import { FlowOverlay } from "@/features/simulate/flow-overlay";
import { CanvasHints } from "./toolbar/canvas-hints";
import { AiPanel } from "@/features/ai/ai-panel";
import { ReviewPanel } from "@/features/review/review-panel";
import { CommandPalette } from "@/features/command/command-palette";
import { ExportDialog } from "@/features/export/export-dialog";
import { ShareDialog } from "@/features/share/share-dialog";
import { TemplatesGallery } from "@/features/templates/templates-gallery";
import { FailureReport } from "@/features/simulate/failure-report";
import { useFailureMode } from "@/features/simulate/failure-mode";
import { useSimStore } from "@/features/simulate/sim-store";
import { useMentorStore, initMentorStore } from "@/features/mentor/mentor-store";
import { useCostStore } from "@/features/cost/cost-store";
import { PATTERNS_CATALOG } from "@archlet/shared";
import type { NodeType, DiagramNode, DiagramEdge } from "@archlet/shared";
import type { PublicDiagramResponse } from "@archlet/shared";

const nodeTypes = customNodeTypes as unknown as NodeTypes;

// ── NodeFailureOverlay ─────────────────────────────────────────────────────
// Renders red "dead" or amber "stranded" overlays on top of RF nodes via DOM.

function NodeFailureOverlay({
  deadNodes,
  strandedNodes,
}: {
  deadNodes: Set<string>;
  strandedNodes: Set<string>;
}) {
  const [, forceRender] = React.useReducer((x: number) => x + 1, 0);

  // Re-render on rAF so positions stay in sync when canvas pans/zooms
  React.useEffect(() => {
    let id: number;
    const loop = () => { forceRender(); id = requestAnimationFrame(loop); };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);

  const allIds = [...deadNodes, ...strandedNodes];
  const containerEl = document.querySelector<HTMLElement>(".react-flow__renderer");
  if (!containerEl) return null;
  const containerRect = containerEl.getBoundingClientRect();

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 8 }}>
      {allIds.map((id) => {
        const el = document.querySelector<HTMLElement>(
          `.react-flow__node[data-id="${id}"]`
        );
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const x = rect.left - containerRect.left;
        const y = rect.top - containerRect.top;
        const isDead = deadNodes.has(id);

        return (
          <div
            key={id}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: rect.width,
              height: rect.height,
              pointerEvents: "none",
            }}
          >
            {/* Coloured overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 12,
                backgroundColor: isDead ? "rgba(239,68,68,0.35)" : "rgba(245,158,11,0.28)",
                border: `2px solid ${isDead ? "#ef4444" : "#f59e0b"}`,
              }}
            />
            {/* Icon */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 900,
                color: isDead ? "#ef4444" : "#d97706",
                textShadow: "0 1px 4px rgba(0,0,0,0.3)",
              }}
            >
              {isDead ? "✕" : "⚠"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface CanvasInnerProps {
  readOnly?: boolean;
}

/** Inline SVG defs for custom arrow markers used by edges. */
function CanvasMarkers() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <marker
          id="archlet-arrow-amber"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="#D97706" />
        </marker>
        <marker
          id="archlet-arrow-plum"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="#6C2BD9" />
        </marker>
        <marker
          id="archlet-arrow-red"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="#EF4444" />
        </marker>
      </defs>
    </svg>
  );
}

function CanvasInner({ readOnly = false }: CanvasInnerProps) {
  const nodes = useDiagramStore((s) => s.nodes);
  const edges = useDiagramStore((s) => s.edges);
  const onNodesChange = useDiagramStore((s) => s.onNodesChange);
  const onEdgesChange = useDiagramStore((s) => s.onEdgesChange);
  const onConnect = useDiagramStore((s) => s.onConnect);
  const addNode = useDiagramStore((s) => s.addNode);
  const { screenToFlowPosition } = useReactFlow();
  const [heroAiOpen, setHeroAiOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const diagramId = useDiagramStore((s) => s.id);
  const diagramName = useDiagramStore((s) => s.name);

  // Failure mode
  const { failureModeActive, deadNodes, toggleDeadNode, toggleFailureMode } = useFailureMode();
  const nodeMetrics = useSimStore((s) => s.nodeMetrics);
  const isSimRunning = useSimStore((s) => s.isRunning);
  const openMentor = useMentorStore((s) => s.open);

  // Init mentor store with diagram id for per-diagram localStorage persistence
  useEffect(() => {
    if (diagramId) initMentorStore(diagramId);
  }, [diagramId]);

  // Trigger initial cost computation once diagram id is set
  useEffect(() => {
    if (diagramId) useCostStore.getState().computeNow();
  }, [diagramId]);

  useKeyboard();

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      if (readOnly) return;
      e.preventDefault();

      // Pattern drop
      const patternId = e.dataTransfer.getData("application/archlet-pattern");
      if (patternId) {
        const pattern = PATTERNS_CATALOG.find((p) => p.id === patternId);
        if (pattern) {
          const dropPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
          const ts = Date.now();
          const idMap = new Map<string, string>();
          const newNodes: DiagramNode[] = pattern.diagram.nodes.map((n) => {
            const newId = `${n.type}-${ts}-${n.id}`;
            idMap.set(n.id, newId);
            return { ...n, id: newId, position: { x: n.position.x + dropPos.x, y: n.position.y + dropPos.y } };
          });
          const newEdges: DiagramEdge[] = pattern.diagram.edges.map((ed) => ({
            ...ed,
            id: `e-${ts}-${ed.id}`,
            source: idMap.get(ed.source) ?? ed.source,
            target: idMap.get(ed.target) ?? ed.target,
          }));
          for (const node of newNodes) addNode(node);
          const connectFn = useDiagramStore.getState().onConnect;
          for (const ed of newEdges) {
            connectFn({ source: ed.source, target: ed.target, sourceHandle: null, targetHandle: null });
          }
        }
        return;
      }

      const raw = e.dataTransfer.getData("application/reactflow");
      if (!raw) return;

      let type: NodeType;
      let variantId: string | undefined;

      // New format: JSON object with { type, variantId }
      if (raw.startsWith("{")) {
        try {
          const parsed = JSON.parse(raw) as { type: NodeType; variantId?: string };
          type = parsed.type;
          variantId = parsed.variantId;
        } catch {
          type = raw as NodeType;
        }
      } else {
        // Legacy plain-string format
        type = raw as NodeType;
      }

      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const rawLabel = type.replace("_", " ");
      const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);
      addNode({
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label, ...(variantId ? { variant: variantId } : {}) },
      });
    },
    [screenToFlowPosition, addNode, readOnly]
  );

  // Compute stranded nodes (downstream of dead, zero arrival)
  const strandedNodes = React.useMemo(() => {
    if (!isSimRunning || deadNodes.size === 0) return new Set<string>();
    const inbound = new Map<string, string[]>();
    for (const node of nodes) inbound.set(node.id, []);
    for (const edge of edges) {
      const arr = inbound.get(edge.target) ?? [];
      arr.push(edge.source);
      inbound.set(edge.target, arr);
    }
    const stranded = new Set<string>();
    for (const node of nodes) {
      if (deadNodes.has(node.id)) continue;
      const sources = inbound.get(node.id) ?? [];
      if (sources.length === 0) continue;
      if (sources.every((src) => deadNodes.has(src))) {
        const metric = nodeMetrics[node.id];
        if ((metric?.arrivalRate ?? 0) === 0) stranded.add(node.id);
      }
    }
    return stranded;
  }, [deadNodes, nodeMetrics, nodes, edges, isSimRunning]);

  // Handle failure-mode node click
  const handleNodeClick = useCallback(
    (_e: React.MouseEvent, node: { id: string }) => {
      if (failureModeActive) {
        toggleDeadNode(node.id);
      }
    },
    [failureModeActive, toggleDeadNode]
  );

  // Drop a pattern at canvas center (used by Cmd+K)
  const dropPattern = useCallback(
    (patternId: string) => {
      const pattern = PATTERNS_CATALOG.find((p) => p.id === patternId);
      if (!pattern) return;
      const ts = Date.now();
      // Canvas center in flow coords
      const cx = 200 + Math.random() * 100;
      const cy = 150 + Math.random() * 100;
      const idMap = new Map<string, string>();
      const newNodes: DiagramNode[] = pattern.diagram.nodes.map((n) => {
        const newId = `${n.type}-${ts}-${n.id}`;
        idMap.set(n.id, newId);
        return {
          ...n,
          id: newId,
          position: { x: n.position.x + cx, y: n.position.y + cy },
        };
      });
      const newEdges: DiagramEdge[] = pattern.diagram.edges.map((e) => ({
        ...e,
        id: `e-${ts}-${e.id}`,
        source: idMap.get(e.source) ?? e.source,
        target: idMap.get(e.target) ?? e.target,
      }));
      for (const node of newNodes) addNode(node);
      const addEdge = useDiagramStore.getState().onConnect;
      for (const edge of newEdges) {
        addEdge({ source: edge.source, target: edge.target, sourceHandle: null, targetHandle: null });
      }
    },
    [addNode]
  );

  const editHandlers = readOnly
    ? {}
    : {
        onNodesChange,
        onEdgesChange,
        onConnect,
        onDrop,
        onDragOver,
        onNodeClick: handleNodeClick,
      };

  return (
    <div
      className="relative w-full h-full bg-cream-50 dark:bg-plum-950"
      style={failureModeActive ? { cursor: "crosshair" } : undefined}
    >
      <CanvasMarkers />
      {!readOnly && <TopToolbar />}
      {!readOnly && <SidePalette />}
      <div className={`w-full h-full ${!readOnly ? "pt-14" : ""}`}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          {...editHandlers}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodesDraggable={!readOnly && !failureModeActive}
          nodesConnectable={!readOnly && !failureModeActive}
          elementsSelectable={!failureModeActive}
          fitView
          deleteKeyCode={null}
          proOptions={{ hideAttribution: false }}
          defaultEdgeOptions={{ type: "default" }}
        >
          <Background variant={BackgroundVariant.Dots} gap={22} size={1.4} />
          <Controls position="bottom-right" showInteractive={false} />
        </ReactFlow>
        {!readOnly && <FlowOverlay />}
        {/* Failure-mode node overlays */}
        {!readOnly && (deadNodes.size > 0 || strandedNodes.size > 0) && (
          <NodeFailureOverlay
            deadNodes={deadNodes}
            strandedNodes={strandedNodes}
          />
        )}
        {/* Kill mode banner */}
        {!readOnly && failureModeActive && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full text-[12px] font-semibold bg-red-600/90 text-white shadow-float backdrop-blur-sm animate-pulse pointer-events-none select-none">
            Click a node to kill it · Click again to revive
          </div>
        )}
        {!readOnly && <CanvasHints onPullAi={() => setHeroAiOpen(true)} />}
      </div>
      {!readOnly && <LevelSwitcher />}
      {!readOnly && <FailureReport />}
      {!readOnly && <PropertiesPanel />}
      {!readOnly && <ReviewPanel />}
      {!readOnly && <AiPanel open={heroAiOpen} onOpenChange={setHeroAiOpen} />}
      {!readOnly && (
        <CommandPalette
          open={paletteOpen}
          onOpenChange={setPaletteOpen}
          onOpenTemplates={() => setTemplatesOpen(true)}
          onOpenExport={() => setExportOpen(true)}
          onOpenShare={() => setShareOpen(true)}
          onOpenAi={() => setHeroAiOpen(true)}
          onOpenReview={() => {}}
          onOpenMentor={openMentor}
          onToggleFailureMode={toggleFailureMode}
          onDropPattern={dropPattern}
        />
      )}
      {!readOnly && (
        <ExportDialog
          open={exportOpen}
          onOpenChange={setExportOpen}
          diagramName={diagramName}
        />
      )}
      {!readOnly && diagramId && (
        <ShareDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          diagram={{ id: diagramId, name: diagramName, publicEmbed: false }}
        />
      )}
      {!readOnly && (
        <TemplatesGallery open={templatesOpen} onOpenChange={setTemplatesOpen} />
      )}
      {readOnly && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] text-ink-500 dark:text-cream-200/50 pointer-events-none tracking-tight">
          Made with <span className="font-semibold text-plum-700 dark:text-plum-300">archlet</span>
        </div>
      )}
    </div>
  );
}

interface CanvasEditorProps {
  readOnly?: boolean;
  initialData?: PublicDiagramResponse;
}

export function CanvasEditor({ readOnly = false, initialData }: CanvasEditorProps) {
  const loadDiagram = useDiagramStore((s) => s.loadDiagram);

  useEffect(() => {
    if (!initialData) return;
    loadDiagram({
      id: initialData.id,
      name: initialData.name,
      activeLevel: initialData.activeLevel,
      levels: initialData.levelData,
    });
  }, [initialData, loadDiagram]);

  return (
    <ReactFlowProvider>
      <CanvasInner readOnly={readOnly} />
    </ReactFlowProvider>
  );
}
