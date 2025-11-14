import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api/client";
import {
  BillingLimits,
  BillingPlan,
  Subscription,
} from "@/lib/validations/billing";
import { QUERY_KEYS } from "@/lib/constants";

export function useBillingLimits() {
  return useQuery({
    queryKey: QUERY_KEYS.BILLING_LIMITS,
    queryFn: () =>
      get<{ data: BillingLimits }>("/billing/limits").then((r) => r.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
}

export function useBillingPlans() {
  return useQuery({
    queryKey: QUERY_KEYS.BILLING_PLANS,
    queryFn: () =>
      get<{ data: { plans: BillingPlan[] } }>("/billing/plans").then(
        (r) => r.data.plans
      ),
    staleTime: 30 * 60 * 1000, // 30 minutes (plans rarely change)
  });
}

export function useSubscription() {
  return useQuery({
    queryKey: QUERY_KEYS.BILLING_SUBSCRIPTION,
    queryFn: () =>
      get<{ data: Subscription }>("/billing/subscription").then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

