/**
 * Centrifugo message types based on backend SourceHandler implementation
 */

/**
 * Processing status message - sent when source processing starts
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
 */
export interface GeminiChunkMessage {
  type: "gemini_chunk";
  jobId: string;
  content: string;
  timestamp: number;
}

/**
 * Gemini complete message - sent when AI generation finishes
 */
export interface GeminiCompleteMessage {
  type: "gemini_complete";
  jobId: string;
  timestamp: number;
}

/**
 * Completed message - sent when entire source processing is done
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
 */
export interface ErrorMessage {
  type: "error";
  sourceId: number;
  error: string;
  timestamp: number;
}

/**
 * Gemini error message - sent when AI generation fails
 */
export interface GeminiErrorMessage {
  type: "gemini_error";
  jobId: string;
  error: string;
  timestamp: number;
}

/**
 * Union type for all source processing messages
 */
export type SourceProcessingMessage =
  | ProcessingMessage
  | GeminiChunkMessage
  | GeminiCompleteMessage
  | CompletedMessage
  | ErrorMessage
  | GeminiErrorMessage;

