import React from "react";
import { SplitSquareHorizontal } from "lucide-react";
import { BaseNode } from "./base-node";
import type { NodeProps } from "@xyflow/react";
import type { RFNode } from "../store/diagram-store";

export const LoadBalancerNode = React.memo(function LoadBalancerNode(props: NodeProps<RFNode>) {
  return (
    <BaseNode
      id={props.id}
      data={props.data}
      selected={props.selected}
      icon={<SplitSquareHorizontal size={14} />}
      colorClass="border-teal-200 dark:border-teal-800"
    />
  );
});
