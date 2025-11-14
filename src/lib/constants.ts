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
// WebSocket connection through Traefik proxy (same domain as backend API)
// Production: wss://primat.bepositive.cz/connection/websocket
// Local: ws://api.primat-plus/connection/websocket
export const CENTRIFUGE_URL =
  process.env.NEXT_PUBLIC_CENTRIFUGE_URL ||
  "ws://api.primat-plus/connection/websocket";
export const CENTRIFUGE_RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000]; // Exponential backoff in ms

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  FREE: "free",
  PREMIUM: "premium",
} as const;

// Free tier limits (aligned with BE spec)
export const FREE_TIER_LIMITS = {
  MAX_SUBJECTS: 1,
  MAX_SOURCES_PER_SUBJECT: 1,
  MAX_TEST_QUESTIONS: 15,
  MAX_FLASHCARDS_PER_GENERATION: 30,
  MAX_CHAT_CONVERSATIONS: 3,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
} as const;

// Premium tier limits (much higher or unlimited)
export const PREMIUM_TIER_LIMITS = {
  MAX_SUBJECTS: 999,
  MAX_SOURCES_PER_SUBJECT: 999,
  MAX_TEST_QUESTIONS: 100,
  MAX_FLASHCARDS_PER_GENERATION: 100,
  MAX_CHAT_CONVERSATIONS: 999,
  MAX_FILE_SIZE: MAX_FILE_SIZE, // 50MB
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
  BILLING_LIMITS: ["billing", "limits"] as const,
  BILLING_PLANS: ["billing", "plans"] as const,
  BILLING_SUBSCRIPTION: ["billing", "subscription"] as const,
} as const;
