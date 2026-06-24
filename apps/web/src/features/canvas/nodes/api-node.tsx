import React from "react";
import { Zap } from "lucide-react";
import { BaseNode } from "./base-node";
import type { NodeProps } from "@xyflow/react";
import type { RFNode } from "../store/diagram-store";

export const ApiNode = React.memo(function ApiNode(props: NodeProps<RFNode>) {
  return (
    <BaseNode
      id={props.id}
      data={props.data}
      selected={props.selected}
      icon={<Zap size={14} />}
      colorClass="border-green-200 dark:border-green-800"
    />
  );
});
