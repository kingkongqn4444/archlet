import React from "react";
import { Cog } from "lucide-react";
import { BaseNode } from "./base-node";
import type { NodeProps } from "@xyflow/react";
import type { RFNode } from "../store/diagram-store";

export const WorkerNode = React.memo(function WorkerNode(props: NodeProps<RFNode>) {
  return (
    <BaseNode
      id={props.id}
      data={props.data}
      selected={props.selected}
      icon={<Cog size={14} />}
      colorClass="border-indigo-200 dark:border-indigo-800"
    />
  );
});
