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
import type { NodeType } from "@archlet/shared";
import type { PublicDiagramResponse } from "@archlet/shared";

const nodeTypes = customNodeTypes as unknown as NodeTypes;

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

  useKeyboard();

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      if (readOnly) return;
      e.preventDefault();
      const type = e.dataTransfer.getData("application/reactflow") as NodeType;
      if (!type) return;
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const rawLabel = type.replace("_", " ");
      const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);
      addNode({ id: `${type}-${Date.now()}`, type, position, data: { label } });
    },
    [screenToFlowPosition, addNode, readOnly]
  );

  const editHandlers = readOnly
    ? {}
    : {
        onNodesChange,
        onEdgesChange,
        onConnect,
        onDrop,
        onDragOver,
      };

  return (
    <div className="relative w-full h-full bg-cream-50 dark:bg-plum-950">
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
          nodesDraggable={!readOnly}
          nodesConnectable={!readOnly}
          elementsSelectable={true}
          fitView
          deleteKeyCode={null}
          proOptions={{ hideAttribution: false }}
          defaultEdgeOptions={{ type: "default" }}
        >
          <Background variant={BackgroundVariant.Dots} gap={22} size={1.4} />
          <Controls position="bottom-right" showInteractive={false} />
        </ReactFlow>
        {!readOnly && <FlowOverlay />}
        {!readOnly && <CanvasHints onPullAi={() => setHeroAiOpen(true)} />}
      </div>
      {!readOnly && <LevelSwitcher />}
      {!readOnly && <PropertiesPanel />}
      {!readOnly && <ReviewPanel />}
      {!readOnly && <AiPanel open={heroAiOpen} onOpenChange={setHeroAiOpen} />}
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
