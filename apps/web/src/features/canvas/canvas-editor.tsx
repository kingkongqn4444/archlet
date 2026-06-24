import React, { useCallback } from "react";
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

const nodeTypes = customNodeTypes as unknown as NodeTypes;

function CanvasInner() {
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
      e.preventDefault();
      const type = e.dataTransfer.getData("application/reactflow") as NodeType;
      if (!type) return;
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const rawLabel = type.replace("_", " ");
      const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);
      addNode({ id: `${type}-${Date.now()}`, type, position, data: { label } });
    },
    [screenToFlowPosition, addNode]
  );

  return (
    <div className="relative w-full h-full">
      <TopToolbar />
      <SidePalette />
      <div className="w-full h-full pt-12">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          deleteKeyCode={null}
          proOptions={{ hideAttribution: false }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls position="bottom-right" />
        </ReactFlow>
      </div>
      <LevelSwitcher />
    </div>
  );
}

export function CanvasEditor() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
