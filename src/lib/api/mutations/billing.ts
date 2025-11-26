import { useMutation, useQueryClient } from "@tanstack/react-query";
import { post } from "@/lib/api/client";
import { QUERY_KEYS } from "@/lib/constants";

interface CheckoutRequest {
  planId: number;
  returnUrl: string;
  notifyUrl: string;
}

interface CheckoutResponse {
  paymentId: string;
  gatewayUrl: string;
  status: string;
}

export function useCheckout() {
  return useMutation({
    mutationFn: (data: CheckoutRequest) =>
      post<{ data: CheckoutResponse }>("/billing/checkout", data).then(
        (r) => r.data
      ),
    onSuccess: (data) => {
      // Redirect to GoPay
      window.location.href = data.gatewayUrl;
    },
  });
}

interface CancelResponse {
  message: string;
  expiresAt: string;
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      post<{ data: CancelResponse }>("/billing/cancel", {}).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BILLING_SUBSCRIPTION,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BILLING_LIMITS,
      });
    },
  });
}

