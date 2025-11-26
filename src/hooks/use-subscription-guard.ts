import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

type SubscriptionType = "free" | "premium";

/**
 * Route guard hook for subscription-based access control
 * @param requiredType - The subscription type required to access the route
 * @returns isLoading state while checking user authentication
 */
export function useSubscriptionGuard(requiredType: SubscriptionType) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Wait for auth to load
    if (isLoading || !user) return;

    const isPremium =
      user.subscriptionType === "premium" || user.subscriptionType === "trial";
    const isFree = user.subscriptionType === "free";

    // Check if user has required access
    if (requiredType === "premium" && !isPremium) {
      // Premium page accessed by free user - redirect to subscription page
      router.push("/predplatne");
    } else if (requiredType === "free" && !isFree) {
      // Free-only page accessed by premium user - redirect to management
      router.push("/predplatne/sprava");
    }
  }, [user, isLoading, requiredType, router]);

  return { isLoading };
}

