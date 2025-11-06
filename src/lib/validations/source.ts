import { z } from "zod";

// Source type enum (matches backend SourceType)
export const sourceTypeSchema = z.enum([
  "document",
  "pdf",
  "docx",
  "doc",
  "txt",
  "youtube",
  "webpage",
  "note",
]);

// Source status enum (matches backend SourceStatus)
export const sourceStatusSchema = z.enum([
  "uploaded",
  "processing",
  "processed",
  "error",
]);

// Source schema (matches backend Source entity)
export const sourceSchema = z.object({
  id: z.number().int().positive(),
  topicId: z.number().int().positive(),
  name: z
    .string()
    .min(1, "Source name is required")
    .max(255, "Source name is too long"),
  type: sourceTypeSchema,
  mimeType: z.string(),
  filePath: z.string().optional().nullable(),
  fileUrl: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  fileSize: z.number().int().positive().optional().nullable(),
  status: sourceStatusSchema,
  jobId: z.string().optional().nullable(),
  startTime: z.number().int().nonnegative().optional().nullable(), // For YouTube
  endTime: z.number().int().nonnegative().optional().nullable(), // For YouTube
  context: z.string().optional().nullable(), // Extracted text content
  contextLength: z.number().int().nonnegative().optional().nullable(),
  errorMessage: z.string().optional().nullable(),
  flashcardsCount: z.number().int().nonnegative().optional().default(0), // Frontend feature
  testsCount: z.number().int().nonnegative().optional().default(0), // Frontend feature
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional().nullable(),
});

// Create source schema (for upload/create operations)
export const createSourceSchema = z.object({
  topicId: z.number().int().positive(),
  name: z.string().min(1).max(255),
  type: sourceTypeSchema,
  file: z.any().optional(), // For file uploads
  url: z.string().url().optional(), // For URL sources
  startTime: z.number().int().nonnegative().optional(), // For YouTube
  endTime: z.number().int().nonnegative().optional(), // For YouTube
});

// Update source schema (currently only supports renaming)
export const updateSourceSchema = z.object({
  name: z.string().min(1).max(255),
});

// Types
export type SourceType = z.infer<typeof sourceTypeSchema>;
export type SourceStatus = z.infer<typeof sourceStatusSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type CreateSourceInput = z.infer<typeof createSourceSchema>;
export type UpdateSourceInput = z.infer<typeof updateSourceSchema>;


