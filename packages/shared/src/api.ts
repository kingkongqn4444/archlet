import { z } from "zod";
import { DiagramLevelDataSchema, LevelEnum } from "./diagram";

// ── Projects ──────────────────────────────────────────────────────────────────

export const CreateProjectRequestSchema = z.object({
  name: z.string().min(1).max(100),
});

export const UpdateProjectRequestSchema = z.object({
  name: z.string().min(1).max(100),
});

export const ProjectResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type CreateProjectRequest = z.infer<typeof CreateProjectRequestSchema>;
export type UpdateProjectRequest = z.infer<typeof UpdateProjectRequestSchema>;
export type ProjectResponse = z.infer<typeof ProjectResponseSchema>;

// ── Diagrams ──────────────────────────────────────────────────────────────────

const LevelDataRecordSchema = z.object({
  high: DiagramLevelDataSchema,
  mid: DiagramLevelDataSchema,
  low: DiagramLevelDataSchema,
});

export const CreateDiagramRequestSchema = z.object({
  projectId: z.string(),
  name: z.string().min(1).max(100).optional(),
  levelData: LevelDataRecordSchema.optional(),
});

export const UpdateDiagramRequestSchema = z.object({
  levelData: LevelDataRecordSchema.optional(),
  activeLevel: LevelEnum.optional(),
  updatedAt: z.number(),
});

export const RenameDiagramRequestSchema = z.object({
  name: z.string().min(1).max(100),
});

export const DiagramResponseSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  ownerId: z.string(),
  name: z.string(),
  levelData: LevelDataRecordSchema,
  activeLevel: LevelEnum,
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type CreateDiagramRequest = z.infer<typeof CreateDiagramRequestSchema>;
export type UpdateDiagramRequest = z.infer<typeof UpdateDiagramRequestSchema>;
export type RenameDiagramRequest = z.infer<typeof RenameDiagramRequestSchema>;
export type DiagramResponse = z.infer<typeof DiagramResponseSchema>;
