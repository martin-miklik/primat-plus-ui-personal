import { z } from "zod";

// User schema (matches backend structure)
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email("Invalid email address"),
  name: z.string().nullable(),
  nickname: z.string().nullable(),
  externalId: z.string().nullable(),
  subscriptionType: z.enum(["free", "premium", "trial"]),
  subscriptionExpiresAt: z.string().nullable(),
  hasActiveSubscription: z.boolean().optional(),
  createdAt: z.string().datetime().nullable(),
  updatedAt: z.string().datetime().nullable(),
});

// Login schema (frontend uses 'email', transformed to 'login' for backend)
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  remember: z.boolean().default(false).optional(),
});

// Register schema
export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Auth response schema (matches backend: { accessToken, user })
export const authResponseSchema = z.object({
  accessToken: z.string(),
  user: userSchema,
});

// Types
export type User = z.infer<typeof userSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
