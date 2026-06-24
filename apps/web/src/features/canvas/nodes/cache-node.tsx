import React from "react";
import { Cpu } from "lucide-react";
import { BaseNode } from "./base-node";
import type { NodeProps } from "@xyflow/react";
import type { RFNode } from "../store/diagram-store";

export const CacheNode = React.memo(function CacheNode(props: NodeProps<RFNode>) {
  return (
    <BaseNode
      id={props.id}
      data={props.data}
      selected={props.selected}
      icon={<Cpu size={16} />}
      accentClass="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300"
    />
  );
});
