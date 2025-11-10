import { z } from "zod";

// Flashcard schema - matches BE API
export const flashcardSchema = z.object({
  id: z.string(),
  sourceId: z.number().int().positive(),
  frontSide: z.string().min(1, "Front side is required"),
  backSide: z.string().min(1, "Back side is required"),
  nextRepetitionDate: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional().nullable(),
});

// Generate flashcards input schema
export const generateFlashcardsSchema = z.object({
  count: z.number().int().min(1).max(30),
});

// Update next repetition input schema
export const updateNextRepetitionSchema = z.object({
  minutesOffset: z.number().int().positive(),
});

// Types
export type Flashcard = z.infer<typeof flashcardSchema>;
export type GenerateFlashcardsInput = z.infer<typeof generateFlashcardsSchema>;
export type UpdateNextRepetitionInput = z.infer<typeof updateNextRepetitionSchema>;
