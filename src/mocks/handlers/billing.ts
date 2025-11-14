import { http, HttpResponse } from "msw";
import { apiPath } from "@/mocks/config";
import {
  mockBillingLimits,
  mockBillingPlans,
  mockFreeSubscription,
} from "../fixtures/billing";

// Simulate delay for realistic API behavior
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const billingHandlers = [
  // GET /api/v1/billing/limits - Get current usage and limits
  http.get(apiPath("/billing/limits"), async () => {
    await delay(300);

    return HttpResponse.json({
      success: true,
      data: mockBillingLimits,
    });
  }),

  // GET /api/v1/billing/plans - Get available subscription plans
  http.get(apiPath("/billing/plans"), async () => {
    await delay(300);

    return HttpResponse.json({
      success: true,
      data: { plans: mockBillingPlans },
    });
  }),

  // POST /api/v1/billing/checkout - Create payment and redirect to GoPay
  http.post(apiPath("/billing/checkout"), async ({ request }) => {
    await delay(500);

    const body = (await request.json()) as {
      planId: number;
      returnUrl: string;
    };

    // In mock mode, redirect to success page immediately
    return HttpResponse.json({
      success: true,
      data: {
        paymentId: "mock-payment-" + Date.now(),
        gatewayUrl: body.returnUrl + "?status=success&mock=true",
        status: "CREATED",
      },
    });
  }),

  // GET /api/v1/billing/subscription - Get current subscription details
  http.get(apiPath("/billing/subscription"), async () => {
    await delay(300);

    return HttpResponse.json({
      success: true,
      data: mockFreeSubscription,
    });
  }),

  // POST /api/v1/billing/cancel - Cancel subscription auto-renewal
  http.post(apiPath("/billing/cancel"), async () => {
    await delay(500);

    return HttpResponse.json({
      success: true,
      data: {
        message: "Předplatné bude zrušeno k 2025-11-28",
        expiresAt: "2025-11-28T12:00:00Z",
      },
    });
  }),
];

