// App-wide constants

// File upload limits
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/msword", // .doc
  "text/plain",
] as const;

export const ALLOWED_FILE_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".doc",
  ".txt",
] as const;

// API configuration
export const API_TIMEOUT = 30000; // 30 seconds
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

// Centrifuge configuration
export const CENTRIFUGE_URL =
  process.env.NEXT_PUBLIC_CENTRIFUGE_URL ||
  "ws://localhost:8000/connection/websocket";
export const CENTRIFUGE_RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000]; // Exponential backoff in ms

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  FREE: "free",
  PREMIUM: "premium",
} as const;

// Free tier limits
export const FREE_TIER_LIMITS = {
  MAX_SUBJECTS: 3,
  MAX_MATERIALS_PER_SUBJECT: 10,
  MAX_FLASHCARDS_PER_MATERIAL: 50,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
} as const;

// Premium tier limits (much higher or unlimited)
export const PREMIUM_TIER_LIMITS = {
  MAX_SUBJECTS: 999,
  MAX_MATERIALS_PER_SUBJECT: 999,
  MAX_FLASHCARDS_PER_MATERIAL: 999,
  MAX_FILE_SIZE: MAX_FILE_SIZE,
} as const;

// Query keys (for TanStack Query)
export const QUERY_KEYS = {
  SUBJECTS: ["subjects"] as const,
  SUBJECT: (id: string) => ["subjects", id] as const,
  TOPICS: (subjectId: string) => ["subjects", subjectId, "topics"] as const,
  TOPIC: (subjectId: string, topicId: string) =>
    ["subjects", subjectId, "topics", topicId] as const,
  MATERIALS: (topicId: string) => ["topics", topicId, "materials"] as const,
  MATERIAL: (materialId: string) => ["materials", materialId] as const,
  FLASHCARDS: (materialId: string) =>
    ["materials", materialId, "flashcards"] as const,
  TESTS: (materialId: string) => ["materials", materialId, "tests"] as const,
  USER: ["user"] as const,
  SUBSCRIPTION: ["subscription"] as const,
} as const;
