/**
 * Mock Centrifugo streaming simulation for development
 */

interface CentrifugoEvent {
  type: "chat_started" | "gemini_chunk" | "gemini_complete" | "chat_error";
  jobId: string;
  content?: string;
  error?: string;
  timestamp: number;
}

/**
 * Simulate streaming by dispatching custom events
 */
function dispatchCentrifugoEvent(channel: string, event: CentrifugoEvent) {
  // Dispatch as custom window event that can be listened to
  window.dispatchEvent(
    new CustomEvent("mock-centrifugo", {
      detail: {
        channel,
        data: event,
      },
    })
  );
}

/**
 * Simulate AI response streaming
 */
export async function simulateStreamingResponse(
  channel: string,
  jobId: string,
  fullResponse: string,
  model: string
): Promise<void> {
  try {
    // Initial delay before starting
    await delay(500);

    // Send chat_started event
    dispatchCentrifugoEvent(channel, {
      type: "chat_started",
      jobId,
      timestamp: Date.now(),
    });

    // Determine delay based on model
    const chunkDelay = model.includes("flash") ? randomDelay(30, 50) : randomDelay(80, 120);

    // Split response into chunks (word by word for realistic streaming)
    const words = fullResponse.split(" ");
    let currentChunk = "";

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      currentChunk = word + " ";

      // Send chunk
      dispatchCentrifugoEvent(channel, {
        type: "gemini_chunk",
        jobId,
        content: currentChunk,
        timestamp: Date.now(),
      });

      // Wait before next chunk
      await delay(chunkDelay);
    }

    // Send completion event
    await delay(200);
    dispatchCentrifugoEvent(channel, {
      type: "gemini_complete",
      jobId,
      timestamp: Date.now(),
    });
  } catch (error) {
    // Send error event
    dispatchCentrifugoEvent(channel, {
      type: "chat_error",
      jobId,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: Date.now(),
    });
  }
}

/**
 * Simulate error during streaming
 */
export function simulateStreamError(
  channel: string,
  jobId: string,
  errorMessage: string
): void {
  dispatchCentrifugoEvent(channel, {
    type: "chat_error",
    jobId,
    error: errorMessage,
    timestamp: Date.now(),
  });
}

/**
 * Listen to mock Centrifugo events
 */
export function listenToMockCentrifugo(
  channel: string,
  callback: (event: CentrifugoEvent) => void
): () => void {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail.channel === channel) {
      callback(customEvent.detail.data);
    }
  };

  window.addEventListener("mock-centrifugo", handler);

  // Return cleanup function
  return () => {
    window.removeEventListener("mock-centrifugo", handler);
  };
}

// Helper functions
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


