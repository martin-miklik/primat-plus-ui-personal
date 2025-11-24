import { ApiError } from "@/lib/errors";
import { usePaywallStore } from "@/stores/paywall-store";
import { mapEndpointToPaywallReason } from "./error-mapping";
import { toast } from "sonner";

/**
 * Handles errors from mutations, triggering paywall if needed.
 * Returns true if paywall was triggered (caller should skip toast).
 */
export function handleMutationError(error: unknown): boolean {
  if (!(error instanceof ApiError)) {
    // Not an API error, show generic toast
    toast.error(error instanceof Error ? error.message : "An error occurred");
    return false;
  }

  // Check if this is a paywall error
  const isPaywall = (error as ApiError & { isPaywallError?: boolean }).isPaywallError;

  if (isPaywall) {
    // Trigger paywall modal - infer reason from endpoint
    const reason = mapEndpointToPaywallReason(error.endpoint);
    usePaywallStore.getState().open(reason, null);
    // Don't show toast - paywall modal will display
    return true;
  }

  // Regular error - show toast
  toast.error(error.message || "An error occurred");
  return false;
}

