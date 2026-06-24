import React, { useCallback, useEffect } from "react";
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
import type { NodeType } from "@archlet/shared";
import type { PublicDiagramResponse } from "@archlet/shared";

const nodeTypes = customNodeTypes as unknown as NodeTypes;

interface CanvasInnerProps {
  readOnly?: boolean;
}

function CanvasInner({ readOnly = false }: CanvasInnerProps) {
  const nodes = useDiagramStore((s) => s.nodes);
  const edges = useDiagramStore((s) => s.edges);
  const onNodesChange = useDiagramStore((s) => s.onNodesChange);
  const onEdgesChange = useDiagramStore((s) => s.onEdgesChange);
  const onConnect = useDiagramStore((s) => s.onConnect);
  const addNode = useDiagramStore((s) => s.addNode);
  const { screenToFlowPosition } = useReactFlow();

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
    <div className="relative w-full h-full">
      {!readOnly && <TopToolbar />}
      {!readOnly && <SidePalette />}
      <div className={`w-full h-full ${!readOnly ? "pt-12" : ""}`}>
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
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls position="bottom-right" />
        </ReactFlow>
      </div>
      {!readOnly && <LevelSwitcher />}
      {readOnly && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-slate-400 pointer-events-none">
          Made with archlet
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
