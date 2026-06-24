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
      icon={<SplitSquareHorizontal size={16} />}
      accentClass="bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300"
    />
  );
});
