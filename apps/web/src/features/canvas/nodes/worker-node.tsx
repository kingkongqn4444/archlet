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
      icon={<Cog size={16} />}
      accentClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300"
    />
  );
});
