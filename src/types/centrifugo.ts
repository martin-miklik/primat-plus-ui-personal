/**
 * Legacy Centrifugo message types
 *
 * DEPRECATED: These types are being phased out in favor of the unified
 * WebSocket event system defined in websocket-events.ts
 *
 * Kept for backward compatibility with existing upload implementation.
 * New code should use the unified event types from websocket-events.ts
 */

/**
 * Processing status message - sent when source processing starts
 * @deprecated Use UploadJobStartedEvent instead
 */
export interface ProcessingMessage {
  type: "processing";
  sourceId: number;
  jobId: string;
  message: string;
  timestamp: number;
}

/**
 * Gemini chunk message - sent during AI content generation (streaming)
 * @deprecated Use UploadChunkEvent instead
 */
export interface GeminiChunkMessage {
  type: "gemini_chunk";
  jobId: string;
  content: string;
  timestamp: number;
}

/**
 * Gemini complete message - sent when AI generation finishes
 * @deprecated Use UploadCompleteEvent instead
 */
export interface GeminiCompleteMessage {
  type: "gemini_complete";
  jobId: string;
  timestamp: number;
}

/**
 * Completed message - sent when entire source processing is done
 * @deprecated Use UploadCompleteEvent instead
 */
export interface CompletedMessage {
  type: "completed";
  sourceId: number;
  jobId: string;
  contextLength: number;
  timestamp: number;
}

/**
 * Error message - sent when processing fails
 * @deprecated Use UploadErrorEvent instead
 */
export interface ErrorMessage {
  type: "error";
  sourceId: number;
  error: string;
  timestamp: number;
}

/**
 * Gemini error message - sent when AI generation fails
 * @deprecated Use UploadErrorEvent instead
 */
export interface GeminiErrorMessage {
  type: "gemini_error";
  jobId: string;
  error: string;
  timestamp: number;
}

/**
 * Union type for all source processing messages
 * @deprecated Use UploadEvent from websocket-events.ts instead
 */
export type SourceProcessingMessage =
  | ProcessingMessage
  | GeminiChunkMessage
  | GeminiCompleteMessage
  | CompletedMessage
  | ErrorMessage
  | GeminiErrorMessage;

// Re-export unified types for convenience
export type {
  UploadEvent,
  ChatEvent,
  FlashcardEvent,
  TestEvent,
  JobEvent,
  JobState,
  ProcessType,
} from "./websocket-events";
