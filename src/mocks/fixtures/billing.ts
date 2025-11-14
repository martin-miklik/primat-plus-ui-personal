import type { BillingLimits, BillingPlan, Subscription } from "@/lib/validations/billing";

export const mockBillingLimits: BillingLimits = {
  subscriptionType: "free",
  subscriptionExpiresAt: null,
  daysSinceRegistration: 7,
  daysUntilPaywall: 7,
  hasUsedTrial: false,
  limits: {
    subjects: { used: 1, max: 1, percentage: 100, isAtLimit: true },
    sources: { used: 0, max: 1, percentage: 0, isAtLimit: false },
    chatConversations: { used: 2, max: 3, percentage: 66, isAtLimit: false },
    testQuestions: { max: 15 },
    flashcards: { max: 30 },
    fileSize: { max: 10485760 },
  },
};

export const mockBillingPlans: BillingPlan[] = [
  {
    id: 1,
    name: "Premium Monthly",
    priceCzk: 199.0,
    priceFormatted: "199 Kč",
    billingPeriod: "monthly",
    trialDays: 14,
    features: [
      "Neomezené předměty",
      "Neomezené materiály",
      "AI chat bez limitů",
      "Testy do 100 otázek",
      "Prioritní podpora",
    ],
  },
  {
    id: 2,
    name: "Premium Yearly",
    priceCzk: 1990.0,
    priceFormatted: "1 990 Kč",
    pricePerMonth: 165.83,
    billingPeriod: "yearly",
    trialDays: 14,
    savingsPercent: 17,
    savingsAmount: 398.0,
    features: [
      "Všechny Premium funkce",
      "Ušetříte 17% ročně",
      "Prioritní podpora",
    ],
  },
];

export const mockFreeSubscription: Subscription = {
  subscriptionType: "free",
  subscriptionExpiresAt: null,
  daysRemaining: null,
  autoRenew: false,
  currentPlan: null,
  paymentHistory: [],
};

export const mockTrialSubscription: Subscription = {
  subscriptionType: "trial",
  subscriptionExpiresAt: "2025-11-28T12:00:00Z",
  daysRemaining: 12,
  autoRenew: true,
  currentPlan: {
    id: 1,
    name: "Premium Monthly",
    priceCzk: 199.0,
    priceFormatted: "199 Kč",
    billingPeriod: "monthly",
    trialDays: 14,
    features: ["Neomezené předměty", "Neomezené materiály"],
    nextBillingDate: "2025-11-28",
    nextBillingAmount: 199.0,
  },
  paymentHistory: [
    {
      date: "2025-11-14",
      amount: 199.0,
      status: "paid",
      description: "Primát Plus - Premium Monthly",
    },
  ],
};

