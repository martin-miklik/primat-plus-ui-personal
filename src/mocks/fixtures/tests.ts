import {
  Test,
  TestInstance,
  UserAnswer,
  TestListItem,
} from "@/lib/validations/test";

// Mock tests for different sources
export const mockTests: Test[] = [
  // Test for "Introduction to Quadratic Equations" (Source ID: 1)
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    sourceId: 1,
    userId: 1,
    questionCount: 10,
    difficulty: ["easy", "medium"],
    questionTypes: ["multiple_choice_single", "true_false"],
    reviewMode: "during",
    status: "ready",
    generatedQuestions: [
      {
        type: "multiple_choice_single",
        question: "Co je kvadratická rovnice?",
        options: [
          { id: "a", text: "Rovnice prvního stupně" },
          { id: "b", text: "Rovnice druhého stupně" },
          { id: "c", text: "Rovnice třetího stupně" },
          { id: "d", text: "Exponenciální rovnice" },
        ],
        correctAnswer: "b",
        explanation:
          "Kvadratická rovnice je rovnice druhého stupně, která má obecný tvar ax² + bx + c = 0.",
      },
      {
        type: "true_false",
        question: "Kvadratická rovnice může mít maximálně dva reálné kořeny.",
        options: [
          { id: "true", text: "Pravda" },
          { id: "false", text: "Nepravda" },
        ],
        correctAnswer: "true",
        explanation:
          "Ano, kvadratická rovnice může mít 0, 1 nebo 2 reálné kořeny, nikdy ne víc.",
      },
      {
        type: "multiple_choice_single",
        question: "Jaký je diskriminant rovnice x² - 4x + 4 = 0?",
        options: [
          { id: "a", text: "0" },
          { id: "b", text: "4" },
          { id: "c", text: "8" },
          { id: "d", text: "-4" },
        ],
        correctAnswer: "a",
        explanation:
          "Diskriminant D = b² - 4ac = 16 - 16 = 0. Když je diskriminant nula, rovnice má jeden dvojnásobný kořen.",
      },
      {
        type: "multiple_choice_single",
        question: "Pomocí jakého vzorce počítáme kořeny kvadratické rovnice?",
        options: [
          { id: "a", text: "x = -b/2a" },
          { id: "b", text: "x = (-b ± √D) / 2a" },
          { id: "c", text: "x = b² - 4ac" },
          { id: "d", text: "x = a + b + c" },
        ],
        correctAnswer: "b",
        explanation:
          "Kořeny kvadratické rovnice se počítají vzorcem x = (-b ± √D) / 2a, kde D je diskriminant.",
      },
      {
        type: "true_false",
        question:
          "Pokud je diskriminant záporný, kvadratická rovnice nemá reálné kořeny.",
        options: [
          { id: "true", text: "Pravda" },
          { id: "false", text: "Nepravda" },
        ],
        correctAnswer: "true",
        explanation:
          "Ano, záporný diskriminant znamená, že rovnice má dva komplexní kořeny, ale žádné reálné.",
      },
      {
        type: "multiple_choice_single",
        question: "Jaký je součet kořenů rovnice x² - 5x + 6 = 0?",
        options: [
          { id: "a", text: "5" },
          { id: "b", text: "-5" },
          { id: "c", text: "6" },
          { id: "d", text: "-6" },
        ],
        correctAnswer: "a",
        explanation:
          "Součet kořenů kvadratické rovnice ax² + bx + c = 0 je -b/a. V tomto případě -(-5)/1 = 5.",
      },
      {
        type: "multiple_choice_single",
        question: "Jaký je součin kořenů rovnice x² - 5x + 6 = 0?",
        options: [
          { id: "a", text: "5" },
          { id: "b", text: "-5" },
          { id: "c", text: "6" },
          { id: "d", text: "-6" },
        ],
        correctAnswer: "c",
        explanation:
          "Součin kořenů kvadratické rovnice ax² + bx + c = 0 je c/a. V tomto případě 6/1 = 6.",
      },
      {
        type: "true_false",
        question: "Rovnice x² + 1 = 0 má reálné kořeny.",
        options: [
          { id: "true", text: "Pravda" },
          { id: "false", text: "Nepravda" },
        ],
        correctAnswer: "false",
        explanation:
          "Ne, diskriminant této rovnice je D = 0 - 4 = -4, což je záporné číslo, takže rovnice nemá reálné kořeny.",
      },
      {
        type: "multiple_choice_single",
        question: "Co znamená, když je diskriminant roven nule?",
        options: [
          { id: "a", text: "Rovnice nemá řešení" },
          { id: "b", text: "Rovnice má jeden dvojnásobný kořen" },
          { id: "c", text: "Rovnice má dva různé kořeny" },
          { id: "d", text: "Rovnice má nekonečně mnoho řešení" },
        ],
        correctAnswer: "b",
        explanation:
          "Když je diskriminant nula, kvadratická rovnice má jeden dvojnásobný (dvojitý) kořen.",
      },
      {
        type: "true_false",
        question:
          "Grafem kvadratické funkce y = ax² + bx + c je parabola.",
        options: [
          { id: "true", text: "Pravda" },
          { id: "false", text: "Nepravda" },
        ],
        correctAnswer: "true",
        explanation:
          "Ano, graf kvadratické funkce je vždy parabola. Pokud je a > 0, parabola má minimum, pokud a < 0, má maximum.",
      },
    ],
    generationError: null,
    aiGenerationTimeMs: 2340,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Test for "Solving Quadratic Equations" (Source ID: 2)
  {
    id: "660e8400-e29b-41d4-a716-446655440001",
    sourceId: 2,
    userId: 1,
    questionCount: 8,
    difficulty: ["medium", "hard"],
    questionTypes: [
      "multiple_choice_single",
      "open_ended",
    ],
    reviewMode: "after",
    status: "ready",
    generatedQuestions: [
      {
        type: "multiple_choice_single",
        question: "Vyřešte rovnici x² - 7x + 12 = 0",
        options: [
          { id: "a", text: "x = 3 nebo x = 4" },
          { id: "b", text: "x = 2 nebo x = 6" },
          { id: "c", text: "x = 1 nebo x = 12" },
          { id: "d", text: "x = -3 nebo x = -4" },
        ],
        correctAnswer: "a",
        explanation:
          "Pomocí rozkladu nebo vzorce: D = 49 - 48 = 1, x = (7 ± 1)/2, tedy x = 3 nebo x = 4.",
      },
      {
        type: "open_ended",
        question:
          "Vysvětlete krok za krokem, jak byste vyřešili rovnici 2x² + 8x - 10 = 0",
        options: null,
        correctAnswer:
          "Nejprve můžeme rovnici zjednodušit vydělením 2: x² + 4x - 5 = 0. Poté použijeme vzorec pro řešení kvadratických rovnic nebo rozklad. Diskriminant D = 16 + 20 = 36. Kořeny: x = (-4 ± 6)/2, tedy x = 1 nebo x = -5.",
        explanation:
          "Správné řešení zahrnuje zjednodušení rovnice, výpočet diskriminantu a aplikaci vzorce pro kořeny.",
      },
      {
        type: "multiple_choice_single",
        question: "Jaký je diskriminant rovnice 3x² + 6x + 3 = 0?",
        options: [
          { id: "a", text: "0" },
          { id: "b", text: "12" },
          { id: "c", text: "36" },
          { id: "d", text: "-12" },
        ],
        correctAnswer: "a",
        explanation:
          "D = b² - 4ac = 36 - 36 = 0. Rovnice má jeden dvojnásobný kořen x = -1.",
      },
      {
        type: "multiple_choice_single",
        question:
          "Kterou metodu NELZE použít k řešení kvadratické rovnice?",
        options: [
          { id: "a", text: "Vzorec pro diskriminant" },
          { id: "b", text: "Rozklad na součin" },
          { id: "c", text: "Doplnění na čtverec" },
          { id: "d", text: "Derivace" },
        ],
        correctAnswer: "d",
        explanation:
          "Derivace se používá k hledání extrémů funkcí, ne k řešení rovnic. Všechny ostatní metody jsou platné pro řešení kvadratických rovnic.",
      },
      {
        type: "open_ended",
        question: "Jak zjistíte, zda má kvadratická rovnice reálné kořeny?",
        options: null,
        correctAnswer:
          "Spočítáme diskriminant D = b² - 4ac. Pokud je D ≥ 0, rovnice má reálné kořeny. Pokud je D > 0, má dva různé reálné kořeny. Pokud je D = 0, má jeden dvojnásobný kořen. Pokud je D < 0, nemá žádné reálné kořeny.",
        explanation:
          "Znaménko diskriminantu určuje počet a typ kořenů kvadratické rovnice.",
      },
      {
        type: "multiple_choice_single",
        question: "Vyřešte rovnici x² = 16",
        options: [
          { id: "a", text: "x = 4" },
          { id: "b", text: "x = ±4" },
          { id: "c", text: "x = 16" },
          { id: "d", text: "x = ±16" },
        ],
        correctAnswer: "b",
        explanation:
          "x² = 16 znamená x = ±√16 = ±4. Obě hodnoty 4 i -4 splňují rovnici.",
      },
      {
        type: "multiple_choice_single",
        question: "Jaký je vrchol paraboly y = x² - 4x + 3?",
        options: [
          { id: "a", text: "[2, -1]" },
          { id: "b", text: "[-2, 15]" },
          { id: "c", text: "[4, 3]" },
          { id: "d", text: "[0, 3]" },
        ],
        correctAnswer: "a",
        explanation:
          "Vrchol paraboly má souřadnice x = -b/2a = 4/2 = 2. Poté y = 4 - 8 + 3 = -1. Vrchol je [2, -1].",
      },
      {
        type: "open_ended",
        question:
          "Napište rovnici paraboly, která má kořeny x = 1 a x = 5 a prochází bodem [0, 10].",
        options: null,
        correctAnswer:
          "Obecný tvar: y = a(x - 1)(x - 5). Dosadíme bod [0, 10]: 10 = a(-1)(-5) = 5a, tedy a = 2. Rovnice je y = 2(x - 1)(x - 5) nebo y = 2x² - 12x + 10.",
        explanation:
          "Použijeme rozklad y = a(x - x₁)(x - x₂) a dosadíme daný bod k určení koeficientu a.",
      },
    ],
    generationError: null,
    aiGenerationTimeMs: 3100,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Test for "Derivatives Introduction" (Source ID: 3) - GENERATING status
  {
    id: "770e8400-e29b-41d4-a716-446655440002",
    sourceId: 3,
    userId: 1,
    questionCount: 15,
    difficulty: ["easy", "medium", "hard"],
    questionTypes: [
      "multiple_choice_single",
      "multiple_choice_multiple",
      "true_false",
      "open_ended",
    ],
    reviewMode: "during",
    status: "generating",
    generatedQuestions: [],
    generationError: null,
    aiGenerationTimeMs: null,
    createdAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
  },
];

// Mock test instances (test sessions)
export const mockTestInstances: TestInstance[] = [
  // Completed instance for first test
  {
    id: "880e8400-e29b-41d4-a716-446655440010",
    testId: "550e8400-e29b-41d4-a716-446655440000",
    userId: 1,
    status: "completed",
    score: 8,
    totalQuestions: 10,
    percentage: 80.0,
    startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  // Active instance for second test
  {
    id: "990e8400-e29b-41d4-a716-446655440011",
    testId: "660e8400-e29b-41d4-a716-446655440001",
    userId: 1,
    status: "active",
    score: null,
    totalQuestions: 8,
    percentage: null,
    startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    completedAt: null,
    expiresAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
];

// Mock user answers
export const mockUserAnswers: UserAnswer[] = [
  // Answers for completed instance
  {
    id: "aa0e8400-e29b-41d4-a716-446655440020",
    instanceId: "880e8400-e29b-41d4-a716-446655440010",
    questionIndex: 0,
    answer: "b",
    isCorrect: true,
    score: 1.0,
    aiFeedback: null,
    answeredAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    evaluatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "bb0e8400-e29b-41d4-a716-446655440021",
    instanceId: "880e8400-e29b-41d4-a716-446655440010",
    questionIndex: 1,
    answer: "true",
    isCorrect: true,
    score: 1.0,
    aiFeedback: null,
    answeredAt: new Date(Date.now() - 2.9 * 60 * 60 * 1000).toISOString(),
    evaluatedAt: new Date(Date.now() - 2.9 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "cc0e8400-e29b-41d4-a716-446655440022",
    instanceId: "880e8400-e29b-41d4-a716-446655440010",
    questionIndex: 2,
    answer: "b",
    isCorrect: false,
    score: 0.0,
    aiFeedback: null,
    answeredAt: new Date(Date.now() - 2.8 * 60 * 60 * 1000).toISOString(),
    evaluatedAt: new Date(Date.now() - 2.8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "dd0e8400-e29b-41d4-a716-446655440023",
    instanceId: "880e8400-e29b-41d4-a716-446655440010",
    questionIndex: 3,
    answer: "b",
    isCorrect: true,
    score: 1.0,
    aiFeedback: null,
    answeredAt: new Date(Date.now() - 2.7 * 60 * 60 * 1000).toISOString(),
    evaluatedAt: new Date(Date.now() - 2.7 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ee0e8400-e29b-41d4-a716-446655440024",
    instanceId: "880e8400-e29b-41d4-a716-446655440010",
    questionIndex: 4,
    answer: "true",
    isCorrect: true,
    score: 1.0,
    aiFeedback: null,
    answeredAt: new Date(Date.now() - 2.6 * 60 * 60 * 1000).toISOString(),
    evaluatedAt: new Date(Date.now() - 2.6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ff0e8400-e29b-41d4-a716-446655440025",
    instanceId: "880e8400-e29b-41d4-a716-446655440010",
    questionIndex: 5,
    answer: "a",
    isCorrect: true,
    score: 1.0,
    aiFeedback: null,
    answeredAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    evaluatedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "000e8400-e29b-41d4-a716-446655440026",
    instanceId: "880e8400-e29b-41d4-a716-446655440010",
    questionIndex: 6,
    answer: "c",
    isCorrect: true,
    score: 1.0,
    aiFeedback: null,
    answeredAt: new Date(Date.now() - 2.4 * 60 * 60 * 1000).toISOString(),
    evaluatedAt: new Date(Date.now() - 2.4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "110e8400-e29b-41d4-a716-446655440027",
    instanceId: "880e8400-e29b-41d4-a716-446655440010",
    questionIndex: 7,
    answer: "false",
    isCorrect: true,
    score: 1.0,
    aiFeedback: null,
    answeredAt: new Date(Date.now() - 2.3 * 60 * 60 * 1000).toISOString(),
    evaluatedAt: new Date(Date.now() - 2.3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "220e8400-e29b-41d4-a716-446655440028",
    instanceId: "880e8400-e29b-41d4-a716-446655440010",
    questionIndex: 8,
    answer: "a",
    isCorrect: false,
    score: 0.0,
    aiFeedback: null,
    answeredAt: new Date(Date.now() - 2.2 * 60 * 60 * 1000).toISOString(),
    evaluatedAt: new Date(Date.now() - 2.2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "330e8400-e29b-41d4-a716-446655440029",
    instanceId: "880e8400-e29b-41d4-a716-446655440010",
    questionIndex: 9,
    answer: "true",
    isCorrect: true,
    score: 1.0,
    aiFeedback: null,
    answeredAt: new Date(Date.now() - 2.1 * 60 * 60 * 1000).toISOString(),
    evaluatedAt: new Date(Date.now() - 2.1 * 60 * 60 * 1000).toISOString(),
  },
  // Answers for active instance (partial)
  {
    id: "440e8400-e29b-41d4-a716-446655440030",
    instanceId: "990e8400-e29b-41d4-a716-446655440011",
    questionIndex: 0,
    answer: "a",
    isCorrect: null,
    score: null,
    aiFeedback: null,
    answeredAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    evaluatedAt: null,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440031",
    instanceId: "990e8400-e29b-41d4-a716-446655440011",
    questionIndex: 1,
    answer:
      "Nejprve vydělím celou rovnici 2, dostanu x² + 4x - 5 = 0. Pak spočítám diskriminant D = 16 + 20 = 36. Kořeny: x = (-4 ± 6)/2, tedy x = 1 nebo x = -5.",
    isCorrect: null,
    score: null,
    aiFeedback: null,
    answeredAt: new Date(Date.now() - 13 * 60 * 1000).toISOString(),
    evaluatedAt: null,
  },
];

// Helper functions
export function getMockTestById(id: string): Test | undefined {
  return mockTests.find((test) => test.id === id);
}

export function getMockTestsBySourceId(sourceId: number): Test[] {
  return mockTests.filter((test) => test.sourceId === sourceId);
}

export function getMockTestInstanceById(id: string): TestInstance | undefined {
  return mockTestInstances.find((instance) => instance.id === id);
}

export function getMockTestInstancesByTestId(testId: string): TestInstance[] {
  return mockTestInstances.filter((instance) => instance.testId === testId);
}

export function getMockUserAnswersByInstanceId(
  instanceId: string
): UserAnswer[] {
  return mockUserAnswers.filter((answer) => answer.instanceId === instanceId);
}

// Generate test list items with instance counts
export function getMockTestListItems(sourceId: number): TestListItem[] {
  return getMockTestsBySourceId(sourceId).map((test) => {
    const instanceCount = getMockTestInstancesByTestId(test.id).length;
    return {
      id: test.id,
      sourceId: test.sourceId,
      questionCount: test.questionCount,
      difficulty: test.difficulty,
      questionTypes: test.questionTypes,
      reviewMode: test.reviewMode,
      status: test.status,
      createdAt: test.createdAt,
      instanceCount,
    };
  });
}

// Counter for generating new IDs
let nextTestIdCounter = 3;
let nextInstanceIdCounter = 12;
let nextAnswerIdCounter = 32;

export function generateMockTestId(): string {
  const id = `${nextTestIdCounter}70e8400-e29b-41d4-a716-44665544000${nextTestIdCounter}`;
  nextTestIdCounter++;
  return id;
}

export function generateMockInstanceId(): string {
  const id = `${nextInstanceIdCounter}0e8400-e29b-41d4-a716-44665544001${nextInstanceIdCounter}`;
  nextInstanceIdCounter++;
  return id;
}

export function generateMockAnswerId(): string {
  const id = `${nextAnswerIdCounter}0e8400-e29b-41d4-a716-44665544003${nextAnswerIdCounter}`;
  nextAnswerIdCounter++;
  return id;
}

// Mock test results for dashboard (simplified view of completed instances)
export const mockTestResults = mockTestInstances
  .filter((instance) => instance.status === "completed")
  .map((instance) => {
    const test = mockTests.find((t) => t.id === instance.testId);
    // We'll need to import sources and subjects to get full details
    // For now, use placeholder values
    const correctAnswers = Math.round((instance.totalQuestions * (instance.score ?? 0)) / 100);
    
    return {
      id: instance.id,
      testId: instance.testId,
      name: `Test ${instance.totalQuestions} otázek`,
      subjectName: "Matematika", // Placeholder - would come from source->topic->subject lookup
      subjectColor: "#3B82F6", // Blue color for Matematika
      score: instance.score ?? 0,
      totalQuestions: instance.totalQuestions,
      correctAnswers,
      completedAt: instance.completedAt ?? new Date().toISOString(),
      questionCount: test?.questionCount ?? instance.totalQuestions,
      percentage: instance.percentage ?? 0,
    };
  });
