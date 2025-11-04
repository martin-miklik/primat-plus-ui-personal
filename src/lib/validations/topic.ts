import { z } from "zod";

// Topic schema
export const topicSchema = z.object({
  id: z.number().int().positive(),
  name: z
    .string()
    .min(1, "Topic name is required")
    .max(100, "Topic name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  subjectId: z.number().int().positive(),
  subjectName: z.string(),
  subjectColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
  lastStudied: z.string().datetime().optional(),
  cardsCount: z.number().int().nonnegative().default(0),
  order: z.number().int().nonnegative().default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Create topic schema (no ID, timestamps)
export const createTopicSchema = topicSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    subjectName: true,
    subjectColor: true,
    cardsCount: true,
    lastStudied: true,
  })
  .extend({
    subjectId: z.number().int().positive().optional(), // Optional since it's passed in the mutation
    order: z.number().int().nonnegative().optional(), // Optional, defaults provided in forms
  });

// Update topic schema (partial, no ID, timestamps)
export const updateTopicSchema = createTopicSchema.partial();

// Types inferred from schemas
export type Topic = z.infer<typeof topicSchema>;
export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
