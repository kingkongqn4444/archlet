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
      icon={<HardDrive size={16} />}
      accentClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300"
    />
  );
});
