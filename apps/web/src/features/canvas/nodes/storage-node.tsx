import React from "react";
import { HardDrive } from "lucide-react";
import { BaseNode } from "./base-node";
import type { NodeProps } from "@xyflow/react";
import type { RFNode } from "../store/diagram-store";

export const StorageNode = React.memo(function StorageNode(props: NodeProps<RFNode>) {
  return (
    <BaseNode
      id={props.id}
      data={props.data}
      selected={props.selected}
      icon={<HardDrive size={14} />}
      colorClass="border-slate-200 dark:border-slate-600"
    />
  );
});
