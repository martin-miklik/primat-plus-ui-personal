import { z } from "zod";

// Flashcard difficulty enum
export const difficultySchema = z.enum(["easy", "medium", "hard"]);

// Flashcard schema
export const flashcardSchema = z.object({
  id: z.string().uuid(),
  sourceId: z.number().int().positive(), // Changed from materialId
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  difficulty: difficultySchema.default("medium"),
  tags: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  // Spaced repetition fields
  nextReviewAt: z.string().datetime().optional(),
  reviewCount: z.number().int().nonnegative().default(0),
  easeFactor: z.number().min(1.3).default(2.5),
  interval: z.number().int().nonnegative().default(0),
});

// Create flashcard schema
export const createFlashcardSchema = flashcardSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  nextReviewAt: true,
  reviewCount: true,
  easeFactor: true,
  interval: true,
});

// Update flashcard schema
export const updateFlashcardSchema = createFlashcardSchema
  .partial()
  .omit({ sourceId: true });

// Review flashcard schema
export const reviewFlashcardSchema = z.object({
  quality: z.number().int().min(0).max(5), // 0-5 scale (SM-2 algorithm)
});

// Types
export type Difficulty = z.infer<typeof difficultySchema>;
export type Flashcard = z.infer<typeof flashcardSchema>;
export type CreateFlashcardInput = z.infer<typeof createFlashcardSchema>;
export type UpdateFlashcardInput = z.infer<typeof updateFlashcardSchema>;
export type ReviewFlashcardInput = z.infer<typeof reviewFlashcardSchema>;
