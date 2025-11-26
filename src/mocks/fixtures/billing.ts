import type {
  BillingLimits,
  BillingPlan,
  Subscription,
} from "@/lib/validations/billing";

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

// Backend returns only one plan (matching actual implementation)
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
      "Neomezené chat konverzace",
      "Neomezené testové otázky",
      "Neomezené kartičky",
      "Žádné limity na velikost souborů",
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

export const mockPremiumSubscription: Subscription = {
  subscriptionType: "premium",
  subscriptionExpiresAt: "2025-12-14T12:00:00Z",
  daysRemaining: 18,
  autoRenew: true,
  currentPlan: {
    id: 1,
    name: "Premium Monthly",
    priceCzk: 199.0,
    priceFormatted: "199 Kč",
    billingPeriod: "monthly",
    trialDays: 14,
    features: ["Neomezené předměty", "Neomezené materiály"],
    nextBillingDate: "2025-12-14",
    nextBillingAmount: 199.0,
  },
  paymentHistory: [
    {
      date: "2025-11-14",
      amount: 199.0,
      status: "paid",
      description: "Primát Plus - Premium Monthly (Trial)",
    },
    {
      date: "2025-10-14",
      amount: 199.0,
      status: "paid",
      description: "Primát Plus - Premium Monthly",
    },
  ],
};

// Premium user limits (shows NULL for unlimited)
export const mockPremiumLimits: BillingLimits = {
  subscriptionType: "premium",
  subscriptionExpiresAt: "2025-12-14T12:00:00Z",
  daysSinceRegistration: 30,
  daysUntilPaywall: 0,
  hasUsedTrial: true,
  limits: {
    subjects: { used: 5, max: null, percentage: null, isAtLimit: false },
    sources: { used: 12, max: null, percentage: null, isAtLimit: false },
    chatConversations: {
      used: 8,
      max: null,
      percentage: null,
      isAtLimit: false,
    },
    testQuestions: { max: null },
    flashcards: { max: null },
    fileSize: { max: null },
  },
};
