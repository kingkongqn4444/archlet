import React from "react";
import { User } from "lucide-react";
import { BaseNode } from "./base-node";
import type { NodeProps } from "@xyflow/react";
import type { RFNode } from "../store/diagram-store";

export const UserNode = React.memo(function UserNode(props: NodeProps<RFNode>) {
  return (
    <BaseNode
      id={props.id}
      data={props.data}
      selected={props.selected}
      icon={<User size={14} />}
      colorClass="border-blue-200 dark:border-blue-800"
    />
  );
});
