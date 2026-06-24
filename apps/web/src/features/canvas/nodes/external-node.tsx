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
      icon={<ExternalLink size={16} />}
      accentClass="bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300"
    />
  );
});
