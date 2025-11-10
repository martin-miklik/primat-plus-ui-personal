/**
 * Chat helper utilities
 */

export type ChatModel = "fast" | "accurate";

/**
 * Generate a unique channel name for a chat session
 */
export function generateChatChannel(sourceId: number): string {
  return `chat:source-${sourceId}:${Date.now()}`;
}

/**
 * Map frontend model selection to backend model name
 */
export function mapModelToBackend(model: ChatModel): string {
  switch (model) {
    case "fast":
      return "gemini-flash-lite-latest";
    case "accurate":
      return "gemini-1.5-pro";
    default:
      return "gemini-flash-lite-latest";
  }
}

/**
 * Format timestamp for display
 */
export function formatChatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Právě teď";
  if (diffMins < 60) return `Před ${diffMins} min`;
  if (diffHours < 24) return `Před ${diffHours} h`;
  if (diffDays < 7) return `Před ${diffDays} dny`;

  return date.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}


