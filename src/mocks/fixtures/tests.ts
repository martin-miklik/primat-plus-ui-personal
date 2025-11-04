import { TestResult, Test, TestAttempt } from "@/lib/validations/test";
import { mockSubjects } from "./subjects";

// Mock test results for dashboard (completed tests)
export const mockTestResults: TestResult[] = [
  {
    id: "test-1-math",
    name: "Kvadratické rovnice - zkouška",
    subjectId: mockSubjects[0].id,
    subjectName: mockSubjects[0].name,
    subjectColor: mockSubjects[0].color,
    score: 92,
    totalQuestions: 12,
    correctAnswers: 11,
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "test-2-physics",
    name: "Newtonovy zákony - test",
    subjectId: mockSubjects[1].id,
    subjectName: mockSubjects[1].name,
    subjectColor: mockSubjects[1].color,
    score: 75,
    totalQuestions: 20,
    correctAnswers: 15,
    completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "test-3-cs",
    name: "Algoritmy - průběžný test",
    subjectId: mockSubjects[2].id,
    subjectName: mockSubjects[2].name,
    subjectColor: mockSubjects[2].color,
    score: 88,
    totalQuestions: 25,
    correctAnswers: 22,
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "test-4-bio",
    name: "Buněčná biologie",
    subjectId: mockSubjects[3].id,
    subjectName: mockSubjects[3].name,
    subjectColor: mockSubjects[3].color,
    score: 56,
    totalQuestions: 18,
    correctAnswers: 10,
    completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "test-5-chem",
    name: "Chemické reakce - záverečný test",
    subjectId: mockSubjects[4].id,
    subjectName: mockSubjects[4].name,
    subjectColor: mockSubjects[4].color,
    score: 94,
    totalQuestions: 15,
    correctAnswers: 14,
    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "test-6-history",
    name: "2. světová válka - přípravný test",
    subjectId: mockSubjects[5].id,
    subjectName: mockSubjects[5].name,
    subjectColor: mockSubjects[5].color,
    score: 68,
    totalQuestions: 30,
    correctAnswers: 20,
    completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "test-7-lit",
    name: "Česká poezie 19. století",
    subjectId: mockSubjects[6].id,
    subjectName: mockSubjects[6].name,
    subjectColor: mockSubjects[6].color,
    score: 82,
    totalQuestions: 22,
    correctAnswers: 18,
    completedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "test-8-math-calc",
    name: "Derivace a integrály - pokročilý test",
    subjectId: mockSubjects[0].id,
    subjectName: mockSubjects[0].name,
    subjectColor: mockSubjects[0].color,
    score: 78,
    totalQuestions: 16,
    correctAnswers: 12,
    completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Helper to get a test result by ID
export function getMockTestResultById(id: string): TestResult | undefined {
  return mockTestResults.find((test) => test.id === id);
}

// Helper to get test results by subject ID
export function getMockTestResultsBySubjectId(subjectId: number): TestResult[] {
  return mockTestResults.filter((test) => test.subjectId === subjectId);
}

// Mock tests (quiz/exam templates) for test handler
export const mockTests: Test[] = [
  {
    id: "quiz-1-math",
    name: "Matematika - Základní test",
    description: "Základní test z matematiky",
    sourceId: 1, // Changed from materialId
    subjectId: mockSubjects[0].id,
    subjectName: mockSubjects[0].name,
    subjectColor: mockSubjects[0].color,
    questions: [
      {
        id: "q1",
        question: "Kolik je 2 + 2?",
        correctAnswer: "4",
        points: 1,
        options: ["3", "4", "5", "6"],
      },
      {
        id: "q2",
        question: "Jaký je Pythagorův vzorec?",
        correctAnswer: "a² + b² = c²",
        points: 2,
      },
    ],
    timeLimit: 600,
    passingScore: 70,
    attemptsCount: 0,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock test attempts
export const mockTestAttempts: TestAttempt[] = [];

// Helper to create a new mock test
export function createMockTest(
  data: Omit<Test, "id" | "createdAt" | "updatedAt" | "attemptsCount">
): Test {
  return {
    id: crypto.randomUUID(),
    ...data,
    attemptsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Helper to get a test by ID
export function getMockTestById(id: string): Test | undefined {
  return mockTests.find((test) => test.id === id);
}
