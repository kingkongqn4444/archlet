import React from "react";
import { ListOrdered } from "lucide-react";
import { BaseNode } from "./base-node";
import type { NodeProps } from "@xyflow/react";
import type { RFNode } from "../store/diagram-store";

export const QueueNode = React.memo(function QueueNode(props: NodeProps<RFNode>) {
  return (
    <BaseNode
      id={props.id}
      data={props.data}
      selected={props.selected}
      icon={<ListOrdered size={16} />}
      accentClass="bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300"
    />
  );
});
