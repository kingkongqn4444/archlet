import React from "react";
import { Database } from "lucide-react";
import { BaseNode } from "./base-node";
import type { NodeProps } from "@xyflow/react";
import type { RFNode } from "../store/diagram-store";

export const DatabaseNode = React.memo(function DatabaseNode(props: NodeProps<RFNode>) {
  return (
    <BaseNode
      id={props.id}
      data={props.data}
      selected={props.selected}
      icon={<Database size={16} />}
      accentClass="bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-300"
    />
  );
});
