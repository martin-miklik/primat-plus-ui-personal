import { z } from "zod";

// Test Question schema
export const testQuestionSchema = z.object({
  id: z.string().uuid(),
  question: z.string().min(1, "Question is required"),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  points: z.number().int().positive().default(1),
  options: z.array(z.string()).optional(),
});

// Test schema (for quiz/exam)
export const testSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Test name is required"),
  description: z.string().optional(),
  materialId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  subjectName: z.string().optional(),
  subjectColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
  questions: z.array(testQuestionSchema),
  timeLimit: z.number().int().positive().optional(),
  passingScore: z.number().int().min(0).max(100).default(70),
  attemptsCount: z.number().int().nonnegative().default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Test Result schema (for dashboard - completed test)
export const testResultSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Test name is required"),
  subjectId: z.string().uuid(),
  subjectName: z.string(),
  subjectColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
  score: z.number().int().min(0).max(100),
  totalQuestions: z.number().int().positive(),
  correctAnswers: z.number().int().nonnegative(),
  completedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Test Attempt schema
export const testAttemptSchema = z.object({
  id: z.string().uuid(),
  testId: z.string().uuid(),
  userId: z.string().uuid(),
  answers: z.record(z.string()),
  score: z.number().int().min(0).max(100),
  passed: z.boolean(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime(),
  timeSpent: z.number().int().nonnegative().optional(),
});

// Create test schema
export const createTestSchema = testSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  attemptsCount: true,
  subjectName: true,
  subjectColor: true,
});

// Update test schema
export const updateTestSchema = createTestSchema.partial();

// Types inferred from schemas
export type TestQuestion = z.infer<typeof testQuestionSchema>;
export type Test = z.infer<typeof testSchema>;
export type TestResult = z.infer<typeof testResultSchema>;
export type TestAttempt = z.infer<typeof testAttemptSchema>;
export type CreateTestInput = z.infer<typeof createTestSchema>;
export type UpdateTestInput = z.infer<typeof updateTestSchema>;
