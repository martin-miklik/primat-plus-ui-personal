import { z } from "zod";

// User schema (matches backend structure)
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email().nullable(),
  name: z.string().nullable(),
  nickname: z.string().nullable(),
  externalId: z.string().nullable(),
  subscriptionType: z.enum(["free", "premium", "trial"]),
  subscriptionExpiresAt: z.string().nullable(),
  hasActiveSubscription: z.boolean().optional(),
  createdAt: z.string().datetime().nullable(),
  updatedAt: z.string().datetime().nullable(),
});

// Login schema (name-based authentication)
export const loginSchema = z.object({
  name: z.string().min(1, "validation.nameRequired"),
  password: z.string().min(8, "validation.passwordMin"),
  remember: z.boolean().default(false).optional(),
});

// Auth response schema (matches backend: { accessToken, user })
export const authResponseSchema = z.object({
  accessToken: z.string(),
  user: userSchema,
});

// Types
export type User = z.infer<typeof userSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
