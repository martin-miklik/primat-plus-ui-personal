import { z } from "zod";

// Card difficulty levels
export const difficultyLevels = ["easy", "medium", "hard", "again"] as const;

// Card schema
export const cardSchema = z.object({
  id: z.string().uuid(),
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  subjectId: z.number().int().positive(),
  subjectName: z.string(),
  subjectColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
  topicId: z.number().int().positive().optional(),
  topicName: z.string().optional(),
  reviewedAt: z.string().datetime().optional(),
  difficulty: z.enum(difficultyLevels).optional(),
  dueDate: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Create card schema
export const createCardSchema = cardSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  subjectName: true,
  subjectColor: true,
  topicName: true,
  reviewedAt: true,
  difficulty: true,
  dueDate: true,
});

// Update card schema
export const updateCardSchema = createCardSchema.partial();

// Types inferred from schemas
export type Card = z.infer<typeof cardSchema>;
export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type Difficulty = (typeof difficultyLevels)[number];












