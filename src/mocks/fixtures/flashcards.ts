import { Flashcard } from "@/lib/validations/flashcard";

export const mockFlashcards: Flashcard[] = [
  // Introduction to Limits flashcards
  {
    id: "f1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
    sourceId: 1,
    question: "What is the definition of a limit?",
    answer:
      "A limit describes the value that a function approaches as the input approaches some value.",
    difficulty: "medium",
    tags: ["calculus", "limits", "definition"],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    nextReviewAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    reviewCount: 3,
    easeFactor: 2.6,
    interval: 2,
  },
  {
    id: "f2b3c4d5-e6f7-8a9b-0c1d-2e3f4a5b6c7d",
    sourceId: 1,
    question: "What is lim(x→0) sin(x)/x?",
    answer: "1",
    difficulty: "hard",
    tags: ["calculus", "limits", "trigonometry"],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    nextReviewAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    reviewCount: 2,
    easeFactor: 2.3,
    interval: 1,
  },
  // Derivatives flashcards
  {
    id: "f3c4d5e6-f7a8-9b0c-1d2e-3f4a5b6c7d8e",
    sourceId: 1,
    question: "What is the derivative of x²?",
    answer: "2x",
    difficulty: "easy",
    tags: ["calculus", "derivatives", "power-rule"],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    nextReviewAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    reviewCount: 5,
    easeFactor: 2.8,
    interval: 5,
  },
  {
    id: "f4d5e6f7-a8b9-0c1d-2e3f-4a5b6c7d8e9f",
    sourceId: 1,
    question: "What is the chain rule?",
    answer:
      "d/dx[f(g(x))] = f'(g(x)) × g'(x). The derivative of a composition of functions.",
    difficulty: "medium",
    tags: ["calculus", "derivatives", "chain-rule"],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    nextReviewAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    reviewCount: 4,
    easeFactor: 2.5,
    interval: 3,
  },
  // Matrix Operations flashcards
  {
    id: "f5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a",
    sourceId: 1,
    question: "What is the identity matrix?",
    answer: "A square matrix with 1s on the diagonal and 0s elsewhere.",
    difficulty: "easy",
    tags: ["linear-algebra", "matrices", "identity"],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    nextReviewAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    reviewCount: 3,
    easeFactor: 2.7,
    interval: 4,
  },
  // Newton's Laws flashcards
  {
    id: "f6f7a8b9-c0d1-2e3f-4a5b-6c7d8e9f0a1b",
    sourceId: 1,
    question: "State Newton's First Law",
    answer:
      "An object at rest stays at rest, and an object in motion stays in motion with the same speed and direction unless acted upon by a force.",
    difficulty: "easy",
    tags: ["physics", "mechanics", "newton"],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    nextReviewAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    reviewCount: 6,
    easeFactor: 2.9,
    interval: 7,
  },
  // Data Structures flashcards
  {
    id: "f7a8b9c0-d1e2-3f4a-5b6c-7d8e9f0a1b2c",
    sourceId: 1,
    question: "What is the time complexity of accessing an array element?",
    answer: "O(1) - constant time",
    difficulty: "medium",
    tags: ["data-structures", "arrays", "complexity"],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    nextReviewAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    reviewCount: 2,
    easeFactor: 2.4,
    interval: 1,
  },
  {
    id: "f8b9c0d1-e2f3-4a5b-6c7d-8e9f0a1b2c3d",
    sourceId: 1,
    question: "What is a linked list?",
    answer:
      "A linear data structure where elements are stored in nodes, each containing data and a reference to the next node.",
    difficulty: "easy",
    tags: ["data-structures", "linked-list"],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    nextReviewAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    reviewCount: 5,
    easeFactor: 2.8,
    interval: 6,
  },
];

export function getMockFlashcardById(id: string): Flashcard | undefined {
  return mockFlashcards.find((card) => card.id === id);
}

export function getMockFlashcardsBySourceId(sourceId: number): Flashcard[] {
  return mockFlashcards.filter((card) => card.sourceId === sourceId);
}

export function createMockFlashcard(
  data: Omit<
    Flashcard,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "nextReviewAt"
    | "reviewCount"
    | "easeFactor"
    | "interval"
  >
): Flashcard {
  return {
    id: crypto.randomUUID(),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reviewCount: 0,
    easeFactor: 2.5,
    interval: 0,
  };
}
