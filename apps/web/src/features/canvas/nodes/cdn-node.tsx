import React from "react";
import { Globe } from "lucide-react";
import { BaseNode } from "./base-node";
import type { NodeProps } from "@xyflow/react";
import type { RFNode } from "../store/diagram-store";

export const CdnNode = React.memo(function CdnNode(props: NodeProps<RFNode>) {
  return (
    <BaseNode
      id={props.id}
      data={props.data}
      selected={props.selected}
      icon={<Globe size={16} />}
      accentClass="bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300"
    />
  );
});
