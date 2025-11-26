import { z } from "zod";

// Test status enum
export const testStatusSchema = z.enum([
  "generating",
  "ready",
  "failed",
]);

// Question type enum
export const questionTypeSchema = z.enum([
  "multiple_choice_single",
  "multiple_choice_multiple",
  "true_false",
  "open_ended",
]);

// Difficulty level enum
export const difficultySchema = z.enum(["easy", "medium", "hard"]);

// Review mode enum
export const reviewModeSchema = z.enum(["during", "after"]);

// Test instance status enum
export const testInstanceStatusSchema = z.enum([
  "active",
  "completed",
  "expired",
]);

// Multiple choice option schema
export const optionSchema = z.object({
  id: z.string(),
  text: z.string(),
});

// Question schema (for test generation and storage)
export const questionSchema = z.object({
  type: questionTypeSchema,
  question: z.string(),
  options: z.array(optionSchema).optional().nullable(),
  correctAnswer: z.union([
    z.string(),
    z.array(z.string()),
    z.boolean(),
  ]),
  explanation: z.string(),
});

// Question for frontend (without correct answer during test)
export const frontendQuestionSchema = z.object({
  index: z.number().int().nonnegative(),
  type: questionTypeSchema,
  question: z.string(),
  options: z.array(optionSchema).optional().nullable(),
});

// Test configuration input (for generation request)
export const testConfigurationSchema = z.object({
  questionCount: z.number().int().min(5).max(50),
  difficulty: z.array(difficultySchema).min(1),
  questionTypes: z.array(questionTypeSchema).min(1),
  reviewMode: reviewModeSchema,
});

// Test schema
export const testSchema = z.object({
  id: z.coerce.string(), // Backend uses auto-increment integers, coerce to string
  sourceId: z.number().int().positive(),
  userId: z.number().int().positive(),
  questionCount: z.number().int().positive(),
  difficulty: z.array(difficultySchema),
  questionTypes: z.array(questionTypeSchema),
  reviewMode: reviewModeSchema,
  generatedQuestions: z.array(questionSchema),
  status: testStatusSchema,
  generationError: z.string().optional().nullable(),
  aiGenerationTimeMs: z.number().int().nonnegative().optional().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Test instance schema
export const testInstanceSchema = z.object({
  id: z.coerce.string(), // Backend uses auto-increment integers, coerce to string
  testId: z.coerce.string(), // Backend uses auto-increment integers, coerce to string
  userId: z.number().int().positive(),
  status: testInstanceStatusSchema,
  score: z.number().int().nonnegative().optional().nullable(),
  totalQuestions: z.number().int().positive(),
  percentage: z.number().min(0).max(100).optional().nullable(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional().nullable(),
  expiresAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// User answer schema
export const userAnswerSchema = z.object({
  id: z.coerce.string(), // Backend uses auto-increment integers, coerce to string
  instanceId: z.coerce.string(), // Backend uses auto-increment integers, coerce to string
  questionIndex: z.number().int().nonnegative(),
  answer: z.union([
    z.string(),
    z.array(z.string()),
    z.boolean(),
  ]),
  isCorrect: z.boolean().optional().nullable(),
  score: z.number().min(0).max(1).optional().nullable(),
  aiFeedback: z.string().optional().nullable(),
  answeredAt: z.string().datetime(),
  evaluatedAt: z.string().datetime().optional().nullable(),
});

// Answer submission input
export const submitAnswerSchema = z.object({
  questionIndex: z.number().int().nonnegative(),
  answer: z.union([
    z.string(),
    z.array(z.string()),
    z.boolean(),
  ]),
});

// Test generation response
export const testGenerationResponseSchema = z.object({
  testId: z.coerce.string(), // Backend uses auto-increment integers, coerce to string
  status: testStatusSchema,
  channel: z.string().optional(), // WebSocket channel for real-time updates
});

// Test instance start response
export const testInstanceStartResponseSchema = z.object({
  instanceId: z.coerce.string(), // Backend uses auto-increment integers, coerce to string
  testId: z.coerce.string(), // Backend uses auto-increment integers, coerce to string
  status: testInstanceStatusSchema,
  reviewMode: reviewModeSchema,
  questions: z.array(frontendQuestionSchema),
  startedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  resumed: z.boolean().optional(), // Flag to indicate if this is resuming an existing instance
  userAnswers: z.array(userAnswerSchema).optional(), // Existing answers when resuming
});

// Answer submission response (for "during" mode with immediate feedback)
export const answerFeedbackResponseSchema = z.object({
  success: z.boolean(),
  isCorrect: z.boolean().optional(),
  correctAnswer: z.union([
    z.string(),
    z.array(z.string()),
    z.boolean(),
  ]).optional(),
  explanation: z.string().optional(),
  score: z.number().min(0).max(1).optional(),
  aiFeedback: z.string().optional(),
  jobId: z.string().optional(), // For async open-ended evaluation
  channel: z.string().optional(), // WebSocket channel for open-ended evaluation
  message: z.string().optional(),
  saved: z.boolean().optional(), // For "after" mode
});

// Test completion response
export const testCompletionResponseSchema = z.object({
  success: z.boolean(),
  instanceId: z.string().uuid(),
  score: z.number().int().nonnegative(),
  totalQuestions: z.number().int().positive(),
  percentage: z.number().min(0).max(100),
  evaluatingCount: z.number().int().nonnegative(), // Open-ended questions still evaluating
  completedAt: z.string().datetime(),
});

// Question result (for results page)
export const questionResultSchema = z.object({
  questionIndex: z.number().int().nonnegative(),
  type: questionTypeSchema,
  question: z.string(),
  options: z.array(optionSchema).optional().nullable(),
  studentAnswer: z.union([
    z.string(),
    z.array(z.string()),
    z.boolean(),
  ]).optional().nullable(),
  correctAnswer: z.union([
    z.string(),
    z.array(z.string()),
    z.boolean(),
  ]),
  isCorrect: z.boolean(),
  explanation: z.string(),
  score: z.number().min(0).max(1).optional().nullable(),
  aiFeedback: z.string().optional().nullable(),
});

// Test results response
export const testResultsResponseSchema = z.object({
  instanceId: z.coerce.string(), // Backend uses auto-increment integers, coerce to string
  testId: z.coerce.string(), // Backend uses auto-increment integers, coerce to string
  score: z.number().int().nonnegative(),
  totalQuestions: z.number().int().positive(),
  percentage: z.number().min(0).max(100),
  completedAt: z.string().datetime(),
  evaluatingCount: z.number().int().nonnegative(),
  results: z.array(questionResultSchema),
});

// Test generation progress update (simulated Centrifugo message)
export const testGenerationProgressSchema = z.object({
  type: z.enum(["generating", "progress", "ready", "failed"]),
  testId: z.string().uuid(),
  status: testStatusSchema.optional(),
  progress: z.number().min(0).max(100).optional(),
  error: z.string().optional(),
});

// Test list item (simplified for listing)
export const testListItemSchema = z.object({
  id: z.string().uuid(),
  sourceId: z.number().int().positive(),
  questionCount: z.number().int().positive(),
  difficulty: z.array(difficultySchema),
  questionTypes: z.array(questionTypeSchema),
  reviewMode: reviewModeSchema,
  status: testStatusSchema,
  createdAt: z.string().datetime(),
  instanceCount: z.number().int().nonnegative().optional().default(0),
});

// Types
export type TestStatus = z.infer<typeof testStatusSchema>;
export type QuestionType = z.infer<typeof questionTypeSchema>;
export type Difficulty = z.infer<typeof difficultySchema>;
export type ReviewMode = z.infer<typeof reviewModeSchema>;
export type TestInstanceStatus = z.infer<typeof testInstanceStatusSchema>;
export type Option = z.infer<typeof optionSchema>;
export type Question = z.infer<typeof questionSchema>;
export type FrontendQuestion = z.infer<typeof frontendQuestionSchema>;
export type TestConfiguration = z.infer<typeof testConfigurationSchema>;
export type Test = z.infer<typeof testSchema>;
export type TestInstance = z.infer<typeof testInstanceSchema>;
export type UserAnswer = z.infer<typeof userAnswerSchema>;
export type SubmitAnswer = z.infer<typeof submitAnswerSchema>;
export type TestGenerationResponse = z.infer<typeof testGenerationResponseSchema>;
export type TestInstanceStartResponse = z.infer<typeof testInstanceStartResponseSchema>;
export type AnswerFeedbackResponse = z.infer<typeof answerFeedbackResponseSchema>;
export type TestCompletionResponse = z.infer<typeof testCompletionResponseSchema>;
export type QuestionResult = z.infer<typeof questionResultSchema>;
export type TestResultsResponse = z.infer<typeof testResultsResponseSchema>;

// Test result for dashboard display
export interface TestResult {
  id: string; // instanceId
  testId: string;
  name: string;
  subjectName: string;
  subjectColor?: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
  // IDs needed for nested routes
  subjectId: string;
  topicId: string;
  sourceId: string;
}
export type TestGenerationProgress = z.infer<typeof testGenerationProgressSchema>;
export type TestListItem = z.infer<typeof testListItemSchema>;
