import { z } from "zod";

// Material type enum
export const materialTypeSchema = z.enum(["pdf", "docx", "doc", "txt", "note"]);

// Material schema
export const materialSchema = z.object({
  id: z.string().uuid(),
  topicId: z.string().uuid(),
  name: z
    .string()
    .min(1, "Material name is required")
    .max(200, "Material name is too long"),
  type: materialTypeSchema,
  fileUrl: z.string().url().optional(),
  content: z.string().optional(),
  fileSize: z.number().int().positive().optional(),
  processingStatus: z.enum(["pending", "processing", "completed", "failed"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  flashcardsCount: z.number().int().nonnegative().default(0),
  testsCount: z.number().int().nonnegative().default(0),
});

// Create material schema
export const createMaterialSchema = materialSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  flashcardsCount: true,
  testsCount: true,
  processingStatus: true,
});

// Update material schema
export const updateMaterialSchema = createMaterialSchema
  .partial()
  .omit({ topicId: true });

// Types
export type MaterialType = z.infer<typeof materialTypeSchema>;
export type Material = z.infer<typeof materialSchema>;
export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;
