/**
 * Unified WebSocket Event Types
 * Based on docs/websocket-states-spec.md
 * 
 * All async jobs share common lifecycle states:
 * - job_started - Job picked up from queue, work begins
 * - Processing events - Active work happening (with optional progress updates)
 * - complete - Job finished successfully
 * - error - Job failed
 */

// ============================================================================
// Base Types
// ============================================================================

export type ProcessType = "upload" | "chat" | "flashcards" | "test";

/**
 * Base interface for all WebSocket job events
 * All events must include these fields
 */
export interface BaseJobEvent {
  type: string;
  jobId: string;
  timestamp: number;
  process: ProcessType;
}

// ============================================================================
// Upload / Source Processing Events
// ============================================================================

export interface UploadJobStartedEvent extends BaseJobEvent {
  type: "job_started";
  process: "upload";
  sourceId: number;
  sourceType: "document" | "image" | "video" | "audio" | "youtube" | "webpage";
}

export interface UploadExtractingEvent extends BaseJobEvent {
  type: "extracting";
  process: "upload";
  message?: string;
}

export interface UploadGeneratingContextEvent extends BaseJobEvent {
  type: "generating_context";
  process: "upload";
}

export interface UploadGeneratingSummaryEvent extends BaseJobEvent {
  type: "generating_summary";
  process: "upload";
  message?: string;
}

export interface UploadCompleteEvent extends BaseJobEvent {
  type: "complete";
  process: "upload";
  sourceId: number;
  contextLength?: number;
}

export interface UploadErrorEvent extends BaseJobEvent {
  type: "error";
  process: "upload";
  error: string;
  message: string;
}

export type UploadEvent =
  | UploadJobStartedEvent
  | UploadExtractingEvent
  | UploadGeneratingContextEvent
  | UploadGeneratingSummaryEvent
  | UploadCompleteEvent
  | UploadErrorEvent;

// ============================================================================
// Chat Events
// ============================================================================

export interface ChatJobStartedEvent extends BaseJobEvent {
  type: "job_started";
  process: "chat";
  model?: string;
  sourceId?: number;
}

export interface ChatChunkEvent extends BaseJobEvent {
  type: "chunk";
  process: "chat";
  content: string;
}

export interface ChatCompleteEvent extends BaseJobEvent {
  type: "complete";
  process: "chat";
  totalTokens?: number;
}

export interface ChatErrorEvent extends BaseJobEvent {
  type: "error";
  process: "chat";
  error: string;
  message: string;
}

export type ChatEvent =
  | ChatJobStartedEvent
  | ChatChunkEvent
  | ChatCompleteEvent
  | ChatErrorEvent;

// ============================================================================
// Flashcard Generation Events
// ============================================================================

export interface FlashcardJobStartedEvent extends BaseJobEvent {
  type: "job_started";
  process: "flashcards";
  sourceId: number;
  count: number;
}

export interface FlashcardGeneratingEvent extends BaseJobEvent {
  type: "generating";
  process: "flashcards";
}

export interface FlashcardCompleteEvent extends BaseJobEvent {
  type: "complete";
  process: "flashcards";
  sourceId: number;
  count: number;
}

export interface FlashcardErrorEvent extends BaseJobEvent {
  type: "error";
  process: "flashcards";
  error: string;
  message: string;
}

export type FlashcardEvent =
  | FlashcardJobStartedEvent
  | FlashcardGeneratingEvent
  | FlashcardCompleteEvent
  | FlashcardErrorEvent;

// ============================================================================
// Test Generation Events
// ============================================================================

export interface TestJobStartedEvent extends BaseJobEvent {
  type: "job_started";
  process: "test";
  sourceId: number;
  questionCount: number;
  difficulty?: string;
}

export interface TestGeneratingEvent extends BaseJobEvent {
  type: "generating";
  process: "test";
  progress?: number; // 0-100
}

export interface TestCompleteEvent extends BaseJobEvent {
  type: "complete";
  process: "test";
  sourceId: number;
  testId: number;
  questionCount: number;
}

export interface TestErrorEvent extends BaseJobEvent {
  type: "error";
  process: "test";
  error: string;
  message: string;
}

// ============================================================================
// Test Answer Evaluation Events (for open-ended questions)
// ============================================================================

export interface TestAnswerEvaluationStartedEvent extends BaseJobEvent {
  type: "job_started";
  process: "test";
  userAnswerId?: number;
  questionIndex?: number;
}

export interface TestAnswerEvaluatingEvent extends BaseJobEvent {
  type: "generating";
  process: "test";
}

export interface TestAnswerEvaluatedEvent extends BaseJobEvent {
  type: "answer_evaluated";
  process: "test";
  userAnswerId: number;
  questionIndex: number;
  score: number;
  isCorrect: boolean;
  feedback: string;
  evaluatedAt: string;
}

export interface TestAnswerEvaluationCompleteEvent extends BaseJobEvent {
  type: "complete";
  process: "test";
  userAnswerId?: number;
  questionIndex?: number;
}

export interface TestAnswerEvaluationErrorEvent extends BaseJobEvent {
  type: "error";
  process: "test";
  error: string;
  message: string;
}

export type TestEvent =
  | TestJobStartedEvent
  | TestGeneratingEvent
  | TestCompleteEvent
  | TestErrorEvent
  | TestAnswerEvaluationStartedEvent
  | TestAnswerEvaluatingEvent
  | TestAnswerEvaluatedEvent
  | TestAnswerEvaluationCompleteEvent
  | TestAnswerEvaluationErrorEvent;

// ============================================================================
// Union Types
// ============================================================================

/**
 * All possible job events across all processes
 */
export type JobEvent = UploadEvent | ChatEvent | FlashcardEvent | TestEvent;

/**
 * Job status derived from event types
 */
export type JobStatus =
  | "pending"
  | "started"
  | "processing"
  | "complete"
  | "error";

// ============================================================================
// Error Codes
// ============================================================================

/**
 * Standardized error codes across all processes
 */
export enum ErrorCode {
  AI_TIMEOUT = "AI_TIMEOUT",
  AI_ERROR = "AI_ERROR",
  CONTEXT_MISSING = "CONTEXT_MISSING",
  INVALID_REQUEST = "INVALID_REQUEST",
  RATE_LIMIT = "RATE_LIMIT",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

/**
 * Error code to user message mapping
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.AI_TIMEOUT]: "AI nereaguje, zkuste to prosím znovu",
  [ErrorCode.AI_ERROR]: "Něco se pokazilo, zkuste to znovu",
  [ErrorCode.CONTEXT_MISSING]: "Zdroj ještě není zpracovaný",
  [ErrorCode.INVALID_REQUEST]: "Neplatné zadání",
  [ErrorCode.RATE_LIMIT]: "Příliš mnoho požadavků, zkuste to za chvíli",
  [ErrorCode.INTERNAL_ERROR]: "Chyba serveru, omlouváme se",
};

// ============================================================================
// Job State Management
// ============================================================================

/**
 * Complete job state with progress tracking
 */
export interface JobState<T extends JobEvent = JobEvent> {
  jobId: string;
  channel: string;
  process: ProcessType;
  status: JobStatus;
  progress: number; // 0-100
  error?: string;
  lastEvent?: T;
  startedAt?: number;
  completedAt?: number;
}

