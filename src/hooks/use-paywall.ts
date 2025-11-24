import { useCallback } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useBillingLimits } from "@/lib/api/queries/billing";
import { usePaywallStore } from "@/stores/paywall-store";
import type { PaywallAction, PaywallReason } from "@/lib/validations/billing";

export function usePaywall() {
  const user = useAuthStore((state) => state.user);
  const { data: limits, isLoading } = useBillingLimits();
  const openPaywall = usePaywallStore((state) => state.open);

  const isPremiumUser =
    user?.subscriptionType === "premium" || user?.subscriptionType === "trial";

  const checkLimit = useCallback(
    (action: PaywallAction): boolean => {
      // Premium users can do anything
      if (isPremiumUser) return true;

      // No limits data yet, allow action (will be caught by backend)
      if (!limits) return true;

      // Check 14-day free period
      if (limits.daysUntilPaywall <= 0) {
        return false;
      }

      // Check specific limits
      switch (action) {
        case "create_subject":
          return !limits.limits.subjects.isAtLimit;

        case "create_source":
          return !limits.limits.sources.isAtLimit;

        case "chat_input":
          // Soft check for input focus (show warning at 80%)
          // Null percentage means unlimited (premium user)
          return (
            limits.limits.chatConversations.percentage === null ||
            limits.limits.chatConversations.percentage < 80
          );

        case "chat_send":
          // Hard check for sending message
          return !limits.limits.chatConversations.isAtLimit;

        case "generate_test":
        case "generate_flashcards":
          // These have dynamic limits, backend will validate
          return true;

        default:
          return true;
      }
    },
    [isPremiumUser, limits]
  );

  const showPaywall = useCallback(
    (reason: PaywallReason) => {
      openPaywall(reason, limits);
    },
    [openPaywall, limits]
  );

  const isAtLimit = useCallback(
    (resource: "subjects" | "sources" | "chat") => {
      if (isPremiumUser || !limits) return false;

      return limits.limits[resource === "chat" ? "chatConversations" : resource]
        .isAtLimit;
    },
    [isPremiumUser, limits]
  );

  return {
    checkLimit,
    showPaywall,
    isAtLimit,
    limits,
    isLoading,
    isPremiumUser,
  };
}
