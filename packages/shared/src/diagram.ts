import { z } from "zod";

export const NodeTypeEnum = z.enum([
  "user",
  "api",
  "database",
  "cache",
  "queue",
  "storage",
  "cdn",
  "load_balancer",
  "worker",
  "external",
]);

export type NodeType = z.infer<typeof NodeTypeEnum>;

export const DiagramNodeSchema = z.object({
  id: z.string(),
  type: NodeTypeEnum,
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.object({
    label: z.string(),
    description: z.string().optional(),
  }),
});

export type DiagramNode = z.infer<typeof DiagramNodeSchema>;

export const DiagramEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  data: z.object({ label: z.string().optional() }).optional(),
});

export type DiagramEdge = z.infer<typeof DiagramEdgeSchema>;

export const LevelEnum = z.enum(["high", "mid", "low"]);
export type Level = z.infer<typeof LevelEnum>;

export const DiagramLevelDataSchema = z.object({
  nodes: z.array(DiagramNodeSchema),
  edges: z.array(DiagramEdgeSchema),
});

export type DiagramLevelData = z.infer<typeof DiagramLevelDataSchema>;

export const DiagramSchema = z.object({
  id: z.string(),
  name: z.string(),
  levels: z.object({
    high: DiagramLevelDataSchema,
    mid: DiagramLevelDataSchema,
    low: DiagramLevelDataSchema,
  }),
  activeLevel: LevelEnum,
});

export type Diagram = z.infer<typeof DiagramSchema>;
