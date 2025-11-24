import type { PaywallReason } from "@/lib/validations/billing";

/**
 * Maps API endpoint to the specific paywall reason.
 * Since backend uses generic LIMIT_EXCEEDED code, we infer from the endpoint.
 */
export function mapEndpointToPaywallReason(endpoint?: string): PaywallReason {
  if (!endpoint) return "subject_limit"; // Default fallback

  // Infer from endpoint path
  if (endpoint.includes("/subjects")) return "subject_limit";
  if (endpoint.includes("/sources")) return "source_limit";
  if (endpoint.includes("/chat")) return "chat_limit_hard";
  if (endpoint.includes("flashcards") && endpoint.includes("generate"))
    return "flashcard_limit";
  if (endpoint.includes("tests") && endpoint.includes("generate"))
    return "test_question_limit";

  // Default fallback
  return "subject_limit";
}

/**
 * Checks if an error response indicates a paywall trigger.
 * Handles both 402 (ideal) and 403 (current backend) status codes.
 */
export function isPaywallError(status: number, errorCode?: string): boolean {
  // Ideal case: 402 Payment Required (when backend implements it)
  if (status === 402) return true;

  // Current backend: 403 with LIMIT_EXCEEDED code
  // This is a limit error, not a permission error
  if (status === 403 && errorCode === "LIMIT_EXCEEDED") return true;

  return false;
}
