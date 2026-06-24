import { z } from "zod";
import { NodeTypeEnum } from "@archlet/shared";

export const AddNodeArgsSchema = z.object({
  id: z.string(),
  type: NodeTypeEnum,
  label: z.string(),
  description: z.string().optional(),
  x: z.number(),
  y: z.number(),
});

export const AddEdgeArgsSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
});

export const UpdateNodeArgsSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  description: z.string().optional(),
});

export const RemoveNodeArgsSchema = z.object({ id: z.string() });
export const RemoveEdgeArgsSchema = z.object({ id: z.string() });

export const ToolCallSchema = z.discriminatedUnion("name", [
  z.object({ name: z.literal("add_node"), args: AddNodeArgsSchema }),
  z.object({ name: z.literal("add_edge"), args: AddEdgeArgsSchema }),
  z.object({ name: z.literal("update_node"), args: UpdateNodeArgsSchema }),
  z.object({ name: z.literal("remove_node"), args: RemoveNodeArgsSchema }),
  z.object({ name: z.literal("remove_edge"), args: RemoveEdgeArgsSchema }),
]);

export type ToolCall = z.infer<typeof ToolCallSchema>;

export interface AIClient {
  stream(opts: {
    apiKey: string;
    model: string;
    systemPrompt: string;
    userPrompt: string;
    signal?: AbortSignal;
  }): AsyncIterable<ToolCall>;
}

// JSON schemas for provider tool registration
export const TOOL_DEFINITIONS = [
  {
    name: "add_node",
    description: "Add a node to the architecture diagram",
    parameters: {
      type: "object",
      properties: {
        id: { type: "string", description: "Unique node id (snake_case)" },
        type: {
          type: "string",
          enum: ["user", "api", "database", "cache", "queue", "storage", "cdn", "load_balancer", "worker", "external"],
        },
        label: { type: "string" },
        description: { type: "string" },
        x: { type: "number", description: "X position 0-1200" },
        y: { type: "number", description: "Y position 0-800" },
      },
      required: ["id", "type", "label", "x", "y"],
    },
  },
  {
    name: "add_edge",
    description: "Connect two nodes with a directed edge",
    parameters: {
      type: "object",
      properties: {
        id: { type: "string" },
        source: { type: "string", description: "Source node id" },
        target: { type: "string", description: "Target node id" },
        label: { type: "string", description: "Edge label e.g. 'REST', 'TCP'" },
      },
      required: ["id", "source", "target"],
    },
  },
  {
    name: "update_node",
    description: "Update label or description of an existing node",
    parameters: {
      type: "object",
      properties: {
        id: { type: "string" },
        label: { type: "string" },
        description: { type: "string" },
      },
      required: ["id"],
    },
  },
  {
    name: "remove_node",
    description: "Remove a node and its connected edges",
    parameters: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
  },
  {
    name: "remove_edge",
    description: "Remove an edge by id",
    parameters: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
  },
];
