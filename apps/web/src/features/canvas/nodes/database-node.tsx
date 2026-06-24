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
      icon={<Database size={14} />}
      colorClass="border-purple-200 dark:border-purple-800"
    />
  );
});
