import React from "react";
import { ExternalLink } from "lucide-react";
import { BaseNode } from "./base-node";
import type { NodeProps } from "@xyflow/react";
import type { RFNode } from "../store/diagram-store";

export const ExternalNode = React.memo(function ExternalNode(props: NodeProps<RFNode>) {
  return (
    <BaseNode
      id={props.id}
      data={props.data}
      selected={props.selected}
      icon={<ExternalLink size={14} />}
      colorClass="border-rose-200 dark:border-rose-800"
    />
  );
});
