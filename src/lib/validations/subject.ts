import { z } from "zod";

// Subject schema
export const subjectSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .min(1, "Subject name is required")
    .max(100, "Subject name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Invalid color format")
    .optional(),
  icon: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  topicsCount: z.number().int().nonnegative().default(0),
  materialsCount: z.number().int().nonnegative().default(0),
});

// Create subject schema (no ID, timestamps)
export const createSubjectSchema = subjectSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  topicsCount: true,
  materialsCount: true,
});

// Update subject schema (partial, no ID, timestamps)
export const updateSubjectSchema = createSubjectSchema.partial();

// Types inferred from schemas
export type Subject = z.infer<typeof subjectSchema>;
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
