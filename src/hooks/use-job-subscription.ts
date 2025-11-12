/**
 * Generic WebSocket Job Subscription Hook
 *
 * Provides a reusable hook for subscribing to job progress via WebSocket.
 * Supports upload, flashcard, test, and chat processes with type-safe event handling.
 *
 * Based on the unified WebSocket event system (see docs/websocket-states-spec.md)
 */

"use client";

import { useEffect, useCallback, useState } from "react";
import { useSubscription } from "./use-centrifuge";
import type {
  JobEvent,
  ProcessType,
  UploadEvent,
  ChatEvent,
  FlashcardEvent,
  TestEvent,
  JobStatus,
} from "@/types/websocket-events";

// Type mapping for process-specific events
type ProcessEventMap = {
  upload: UploadEvent;
  chat: ChatEvent;
  flashcards: FlashcardEvent;
  test: TestEvent;
};

export interface UseJobSubscriptionOptions<P extends ProcessType> {
  /** WebSocket channel to subscribe to */
  channel: string | undefined;

  /** Process type (upload, chat, flashcards, test) */
  process: P;

  /** Whether the subscription is enabled */
  enabled?: boolean;

  /** Called when any event is received */
  onEvent?: (event: ProcessEventMap[P]) => void;

  /** Called when job starts */
  onStarted?: (event: ProcessEventMap[P]) => void;

  /** Called on progress updates (extracting, generating, chunk, etc.) */
  onProgress?: (event: ProcessEventMap[P]) => void;

  /** Called when job completes successfully */
  onComplete?: (event: ProcessEventMap[P]) => void;

  /** Called when job encounters an error */
  onError?: (event: ProcessEventMap[P], error: string) => void;
}

export interface JobSubscriptionState {
  /** Current job status */
  status: JobStatus;

  /** Progress percentage (0-100) */
  progress: number;

  /** Whether the subscription is active */
  isSubscribed: boolean;

  /** Error message if status is error */
  error?: string;

  /** Last event received */
  lastEvent?: JobEvent;
}

/**
 * Calculate progress based on event type and process
 */
function calculateProgress(event: JobEvent): number {
  switch (event.type) {
    case "job_started":
      return 5;

    case "extracting":
      return 20;

    case "generating_context":
      return 30;

    case "generating_summary":
      return 60;

    case "generating":
      return 50;

    case "chunk":
      // Only for chat streaming (upload doesn't use chunks)
      return 50;

    case "complete":
      return 100;

    case "error":
      return 0;

    default:
      return 10;
  }
}

/**
 * Map event type to job status
 */
function eventTypeToStatus(type: string): JobStatus {
  switch (type) {
    case "job_started":
      return "started";

    case "extracting":
    case "generating_context":
    case "generating_summary":
    case "generating":
    case "chunk":
      return "processing";

    case "complete":
      return "complete";

    case "error":
      return "error";

    default:
      return "pending";
  }
}

/**
 * Generic hook for subscribing to job progress via WebSocket
 *
 * @example
 * ```tsx
 * const { status, progress, isSubscribed, error } = useJobSubscription({
 *   channel: "flashcards:job:abc-123",
 *   process: "flashcards",
 *   enabled: true,
 *   onComplete: () => {
 *     refetchFlashcards();
 *   },
 *   onError: (event, error) => {
 *     toast.error(error);
 *   }
 * });
 * ```
 */
export function useJobSubscription<P extends ProcessType>({
  channel,
  process,
  enabled = true,
  onEvent,
  onStarted,
  onProgress,
  onComplete,
  onError,
}: UseJobSubscriptionOptions<P>): JobSubscriptionState {
  const [state, setState] = useState<JobSubscriptionState>({
    status: "pending",
    progress: 0,
    isSubscribed: false,
  });

  // Handle incoming WebSocket events
  const handlePublication = useCallback(
    (data: JobEvent) => {
      // Validate process type matches
      if (data.process !== process) {
        console.warn(
          `[JobSubscription] Process mismatch: expected ${process}, got ${data.process}`
        );
        return;
      }

      const typedEvent = data as ProcessEventMap[P];
      const newStatus = eventTypeToStatus(data.type);
      const newProgress = calculateProgress(data);

      // Update state
      setState((prev) => {
        // Extract error message if event is an error
        let errorMessage: string | undefined;
        if (data.type === "error") {
          const errorEvent = data as { message?: string; error?: string };
          errorMessage = errorEvent.message || errorEvent.error;
        }

        return {
          ...prev,
          status: newStatus,
          progress: Math.max(prev.progress, newProgress), // Never decrease progress
          error: errorMessage,
          lastEvent: data,
        };
      });

      // Call generic event handler
      onEvent?.(typedEvent);

      // Call specific event handlers
      switch (data.type) {
        case "job_started":
          onStarted?.(typedEvent);
          break;

        case "extracting":
        case "generating_context":
        case "generating":
        case "chunk":
          onProgress?.(typedEvent);
          break;

        case "complete":
          onComplete?.(typedEvent);
          break;

        case "error": {
          const errorEvent = data as { message?: string; error?: string };
          onError?.(
            typedEvent,
            errorEvent.message || errorEvent.error || "Unknown error"
          );
          break;
        }
      }
    },
    [process, onEvent, onStarted, onProgress, onComplete, onError]
  );

  // Subscribe to WebSocket channel
  const { isSubscribed } = useSubscription<JobEvent>(channel || "", {
    enabled: enabled && !!channel,
    onPublication: handlePublication,
    onSubscribed: () => {
      setState((prev) => ({ ...prev, isSubscribed: true }));
    },
    onUnsubscribed: () => {
      setState((prev) => ({ ...prev, isSubscribed: false }));
    },
    onError: (error) => {
      console.error(`[JobSubscription] Error on channel ${channel}:`, error);
      setState((prev) => ({
        ...prev,
        status: "error",
        error: error.message,
      }));
    },
  });

  // Update subscription state
  useEffect(() => {
    setState((prev) => ({ ...prev, isSubscribed }));
  }, [isSubscribed]);

  return state;
}
