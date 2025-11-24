import { z } from "zod";

export const billingPlanSchema = z.object({
  id: z.number(),
  name: z.string(),
  priceCzk: z.number(),
  priceFormatted: z.string(),
  pricePerMonth: z.number().optional(),
  billingPeriod: z.enum(["monthly", "yearly"]),
  trialDays: z.number(),
  savingsPercent: z.number().optional(),
  savingsAmount: z.number().optional(),
  features: z.array(z.string()),
});

export const billingLimitsSchema = z.object({
  subscriptionType: z.enum(["free", "trial", "premium"]),
  subscriptionExpiresAt: z.string().nullable(),
  daysSinceRegistration: z.number(),
  daysUntilPaywall: z.number(),
  hasUsedTrial: z.boolean(),
  limits: z.object({
    subjects: z.object({
      used: z.number(),
      max: z.number().nullable(), // Null for premium users
      percentage: z.number().nullable(), // Null for premium users
      isAtLimit: z.boolean(),
    }),
    sources: z.object({
      used: z.number(),
      max: z.number().nullable(), // Null for premium users
      percentage: z.number().nullable(), // Null for premium users
      isAtLimit: z.boolean(),
    }),
    chatConversations: z.object({
      used: z.number(),
      max: z.number().nullable(), // Null for premium users
      percentage: z.number().nullable(), // Null for premium users
      isAtLimit: z.boolean(),
    }),
    testQuestions: z.object({ max: z.number().nullable() }), // Null for premium
    flashcards: z.object({ max: z.number().nullable() }), // Null for premium
    fileSize: z.object({ max: z.number().nullable() }), // Null for premium
  }),
});

export const subscriptionSchema = z.object({
  subscriptionType: z.enum(["free", "trial", "premium"]),
  subscriptionExpiresAt: z.string().nullable(),
  daysRemaining: z.number().nullable(),
  autoRenew: z.boolean(),
  currentPlan: billingPlanSchema
    .extend({
      nextBillingDate: z.string().optional(),
      nextBillingAmount: z.number().optional(),
    })
    .nullable(),
  paymentHistory: z.array(
    z.object({
      date: z.string(),
      amount: z.number(),
      status: z.string(),
      description: z.string(),
    })
  ),
});

export type BillingPlan = z.infer<typeof billingPlanSchema>;
export type BillingLimits = z.infer<typeof billingLimitsSchema>;
export type Subscription = z.infer<typeof subscriptionSchema>;

export type PaywallReason =
  | "subject_limit"
  | "source_limit"
  | "chat_limit_soft"
  | "chat_limit_hard"
  | "test_question_limit"
  | "flashcard_limit";

export type PaywallAction =
  | "create_subject"
  | "create_source"
  | "chat_input"
  | "chat_send"
  | "generate_test"
  | "generate_flashcards";

