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
  publicEmbed: z.boolean().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type CreateDiagramRequest = z.infer<typeof CreateDiagramRequestSchema>;
export type UpdateDiagramRequest = z.infer<typeof UpdateDiagramRequestSchema>;
export type RenameDiagramRequest = z.infer<typeof RenameDiagramRequestSchema>;
export type DiagramResponse = z.infer<typeof DiagramResponseSchema>;

// ── Share ─────────────────────────────────────────────────────────────────────

export const CreateShareRequestSchema = z.object({
  diagramId: z.string(),
  expiresIn: z.number().positive().optional(),
});

export const ShareResponseSchema = z.object({
  token: z.string(),
  url: z.string(),
  diagramId: z.string(),
  diagramName: z.string(),
  createdAt: z.number(),
  expiresAt: z.number().nullable(),
});

export const PublicDiagramResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  levelData: z.object({
    high: DiagramLevelDataSchema,
    mid: DiagramLevelDataSchema,
    low: DiagramLevelDataSchema,
  }),
  activeLevel: LevelEnum,
});

export const SetEmbedRequestSchema = z.object({
  enabled: z.boolean(),
});

export type CreateShareRequest = z.infer<typeof CreateShareRequestSchema>;
export type ShareResponse = z.infer<typeof ShareResponseSchema>;
export type PublicDiagramResponse = z.infer<typeof PublicDiagramResponseSchema>;
export type SetEmbedRequest = z.infer<typeof SetEmbedRequestSchema>;
