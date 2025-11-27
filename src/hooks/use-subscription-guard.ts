import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/lib/api/queries/billing";

type SubscriptionType = "free" | "premium";

/**
 * Route guard hook for subscription-based access control
 * Handles all user flows including canceled subscriptions
 * @param requiredType - The subscription type required to access the route
 * @returns isLoading state and subscription data
 */
export function useSubscriptionGuard(requiredType: SubscriptionType) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { data: subscription, isLoading: subLoading } = useSubscription();

  const isLoading = authLoading || subLoading;

  useEffect(() => {
    // Wait for both auth and subscription to load
    if (isLoading || !user) return;

    const isPremium =
      user.subscriptionType === "premium" || user.subscriptionType === "trial";
    const isFree = user.subscriptionType === "free";

    // Check if user has required access
    if (requiredType === "premium" && !isPremium) {
      // Premium page accessed by free user - redirect to subscription page
      router.push("/predplatne");
    } else if (requiredType === "free") {
      // Free-only pages (checkout, subscription landing)
      
      // Allow if truly free
      if (isFree) return;

      // Allow premium users who have CANCELED (autoRenew = false) to re-subscribe
      if (isPremium && subscription && !subscription.autoRenew) {
        return; // Let them access /predplatne and /checkout to reactivate
      }

      // Block active premium/trial users - redirect to management
      if (isPremium) {
        router.push("/predplatne/sprava");
      }
    }
  }, [user, subscription, isLoading, requiredType, router]);

  return { isLoading, subscription };
}

