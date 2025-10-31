import { Card } from "@/lib/validations/card";
import { mockSubjects } from "./subjects";
import { mockTopics } from "./topics";

export const mockCards: Card[] = [
  {
    id: "c1-math-quad",
    question: "Co je diskriminant kvadratické rovnice?",
    answer:
      "Diskriminant je výraz D = b² - 4ac, který určuje počet a typ kořenů kvadratické rovnice.",
    subjectId: mockSubjects[0].id,
    subjectName: mockSubjects[0].name,
    subjectColor: mockSubjects[0].color,
    topicId: mockTopics[0].id,
    topicName: mockTopics[0].name,
    reviewedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    difficulty: "easy",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "c2-math-derivative",
    question: "Jaká je derivace funkce f(x) = x²?",
    answer: "f'(x) = 2x",
    subjectId: mockSubjects[0].id,
    subjectName: mockSubjects[0].name,
    subjectColor: mockSubjects[0].color,
    topicId: mockTopics[1].id,
    topicName: mockTopics[1].name,
    reviewedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    difficulty: "medium",
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "c3-physics-newton1",
    question: "Co říká první Newtonův zákon?",
    answer:
      "Těleso setrvává v klidu nebo v rovnoměrném přímočarém pohybu, dokud na něj nepůsobí vnější síla.",
    subjectId: mockSubjects[1].id,
    subjectName: mockSubjects[1].name,
    subjectColor: mockSubjects[1].color,
    topicId: mockTopics[2].id,
    topicName: mockTopics[2].name,
    reviewedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    difficulty: "easy",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "c4-physics-thermo",
    question: "Co je entropie?",
    answer:
      "Entropie je míra neuspořádanosti systému nebo množství tepelné energie, která není k dispozici pro práci.",
    subjectId: mockSubjects[1].id,
    subjectName: mockSubjects[1].name,
    subjectColor: mockSubjects[1].color,
    topicId: mockTopics[3].id,
    topicName: mockTopics[3].name,
    reviewedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    difficulty: "hard",
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "c5-cs-quicksort",
    question: "Jaká je průměrná časová složitost QuickSort?",
    answer: "O(n log n) v průměrném případě",
    subjectId: mockSubjects[2].id,
    subjectName: mockSubjects[2].name,
    subjectColor: mockSubjects[2].color,
    topicId: mockTopics[4].id,
    topicName: mockTopics[4].name,
    reviewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    difficulty: "medium",
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "c6-cs-stack",
    question: "Co je zásobník (stack)?",
    answer:
      "Datová struktura typu LIFO (Last In, First Out), kde poslední přidaný prvek je vyjmut jako první.",
    subjectId: mockSubjects[2].id,
    subjectName: mockSubjects[2].name,
    subjectColor: mockSubjects[2].color,
    topicId: mockTopics[5].id,
    topicName: mockTopics[5].name,
    reviewedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    difficulty: "easy",
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "c7-bio-mitochondria",
    question: "Jakou funkci má mitochondrie?",
    answer:
      "Mitochondrie jsou organely zodpovědné za produkci energie v buňce prostřednictvím buněčného dýchání.",
    subjectId: mockSubjects[3].id,
    subjectName: mockSubjects[3].name,
    subjectColor: mockSubjects[3].color,
    topicId: mockTopics[6].id,
    topicName: mockTopics[6].name,
    reviewedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    difficulty: "easy",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "c8-chem-ph",
    question: "Co znamená pH 7?",
    answer:
      "pH 7 označuje neutrální roztok, kde koncentrace H+ iontů se rovná koncentraci OH- iontů.",
    subjectId: mockSubjects[4].id,
    subjectName: mockSubjects[4].name,
    subjectColor: mockSubjects[4].color,
    topicId: mockTopics[7].id,
    topicName: mockTopics[7].name,
    reviewedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    difficulty: "easy",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "c9-history-wwii-start",
    question: "Kdy začala druhá světová válka?",
    answer: "1. září 1939 napadením Polska nacistickým Německem",
    subjectId: mockSubjects[5].id,
    subjectName: mockSubjects[5].name,
    subjectColor: mockSubjects[5].color,
    topicId: mockTopics[8].id,
    topicName: mockTopics[8].name,
    reviewedAt: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
    difficulty: "easy",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "c10-lit-macha",
    question: "Kdo napsal Máj?",
    answer: "Karel Hynek Mácha",
    subjectId: mockSubjects[6].id,
    subjectName: mockSubjects[6].name,
    subjectColor: mockSubjects[6].color,
    topicId: mockTopics[9].id,
    topicName: mockTopics[9].name,
    reviewedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    difficulty: "easy",
    dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "c11-math-integration",
    question: "Co je neurčitý integrál?",
    answer:
      "Neurčitý integrál je obecná primitivní funkce k dané funkci, značí se ∫f(x)dx.",
    subjectId: mockSubjects[0].id,
    subjectName: mockSubjects[0].name,
    subjectColor: mockSubjects[0].color,
    topicId: mockTopics[1].id,
    topicName: mockTopics[1].name,
    reviewedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    difficulty: "medium",
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "c12-cs-bst",
    question: "Co je binární vyhledávací strom?",
    answer:
      "Binární strom, kde každý uzel má hodnotu větší než všechny uzly v levém podstromu a menší než uzly v pravém podstromu.",
    subjectId: mockSubjects[2].id,
    subjectName: mockSubjects[2].name,
    subjectColor: mockSubjects[2].color,
    topicId: mockTopics[5].id,
    topicName: mockTopics[5].name,
    reviewedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    difficulty: "medium",
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "c13-physics-newton2",
    question: "Jak zní druhý Newtonův zákon?",
    answer:
      "Síla působící na těleso je rovna součinu hmotnosti tělesa a jeho zrychlení: F = ma",
    subjectId: mockSubjects[1].id,
    subjectName: mockSubjects[1].name,
    subjectColor: mockSubjects[1].color,
    topicId: mockTopics[2].id,
    topicName: mockTopics[2].name,
    reviewedAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    difficulty: "easy",
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 41 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "c14-bio-dna",
    question: "Z čeho se skládá DNA?",
    answer:
      "DNA se skládá z nukleotidů obsahujících dusíkatou bázi, cukr (deoxyribózu) a fosfátovou skupinu.",
    subjectId: mockSubjects[3].id,
    subjectName: mockSubjects[3].name,
    subjectColor: mockSubjects[3].color,
    topicId: mockTopics[6].id,
    topicName: mockTopics[6].name,
    reviewedAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
    difficulty: "medium",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 44 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "c15-chem-periodic",
    question: "Kdo vytvořil periodickou tabulku prvků?",
    answer: "Dmitrij Ivanovič Mendělejev v roce 1869",
    subjectId: mockSubjects[4].id,
    subjectName: mockSubjects[4].name,
    subjectColor: mockSubjects[4].color,
    topicId: mockTopics[7].id,
    topicName: mockTopics[7].name,
    reviewedAt: new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString(),
    difficulty: "easy",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 48 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString(),
  },
];

// Helper to get a card by ID
export function getMockCardById(id: string): Card | undefined {
  return mockCards.find((card) => card.id === id);
}

// Helper to get cards by subject ID
export function getMockCardsBySubjectId(subjectId: string): Card[] {
  return mockCards.filter((card) => card.subjectId === subjectId);
}

// Helper to get cards by topic ID
export function getMockCardsByTopicId(topicId: string): Card[] {
  return mockCards.filter((card) => card.topicId === topicId);
}











