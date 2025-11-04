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
  "ws://ws.api.primat-plus.localhost/connection/websocket";
export const CENTRIFUGE_RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000]; // Exponential backoff in ms

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  FREE: "free",
  PREMIUM: "premium",
} as const;

// Free tier limits
export const FREE_TIER_LIMITS = {
  MAX_SUBJECTS: 3,
  MAX_SOURCES_PER_SUBJECT: 10,
  MAX_FLASHCARDS_PER_SOURCE: 50,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
} as const;

// Premium tier limits (much higher or unlimited)
export const PREMIUM_TIER_LIMITS = {
  MAX_SUBJECTS: 999,
  MAX_SOURCES_PER_SUBJECT: 999,
  MAX_FLASHCARDS_PER_SOURCE: 999,
  MAX_FILE_SIZE: MAX_FILE_SIZE,
} as const;

// Query keys (for TanStack Query)
export const QUERY_KEYS = {
  SUBJECTS: ["subjects"] as const,
  SUBJECT: (id: number) => ["subjects", id] as const,
  TOPICS: (subjectId: number) => ["subjects", subjectId, "topics"] as const,
  TOPIC: (subjectId: number, topicId: number) =>
    ["subjects", subjectId, "topics", topicId] as const,
  SOURCES: (topicId: number) => ["topics", topicId, "sources"] as const,
  SOURCE: (sourceId: number) => ["sources", sourceId] as const,
  FLASHCARDS: (sourceId: number) =>
    ["sources", sourceId, "flashcards"] as const,
  TESTS: (sourceId: number) => ["sources", sourceId, "tests"] as const,
  USER: ["user"] as const,
  SUBSCRIPTION: ["subscription"] as const,
} as const;
