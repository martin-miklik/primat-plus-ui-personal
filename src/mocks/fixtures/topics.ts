import { Topic } from "@/lib/validations/topic";
import { mockSubjects } from "./subjects";

export const mockTopics: Topic[] = [
  {
    id: 1,
    name: "Kvadratické rovnice",
    subjectId: mockSubjects[0].id,
    subjectName: mockSubjects[0].name,
    subjectColor: mockSubjects[0].color,
    lastStudied: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    cardsCount: 15,
    order: 0,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    name: "Derivace a integrály",
    subjectId: mockSubjects[0].id,
    subjectName: mockSubjects[0].name,
    subjectColor: mockSubjects[0].color,
    lastStudied: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    cardsCount: 22,
    order: 1,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    name: "Newtonovy zákony",
    subjectId: mockSubjects[1].id,
    subjectName: mockSubjects[1].name,
    subjectColor: mockSubjects[1].color,
    lastStudied: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    cardsCount: 18,
    order: 0,
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    name: "Termodynamika",
    subjectId: mockSubjects[1].id,
    subjectName: mockSubjects[1].name,
    subjectColor: mockSubjects[1].color,
    lastStudied: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    cardsCount: 12,
    order: 1,
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    name: "Algoritmy řazení",
    subjectId: mockSubjects[2].id,
    subjectName: mockSubjects[2].name,
    subjectColor: mockSubjects[2].color,
    lastStudied: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    cardsCount: 20,
    order: 0,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 6,
    name: "Datové struktury",
    subjectId: mockSubjects[2].id,
    subjectName: mockSubjects[2].name,
    subjectColor: mockSubjects[2].color,
    lastStudied: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    cardsCount: 25,
    order: 1,
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 7,
    name: "Buněčná biologie",
    subjectId: mockSubjects[3].id,
    subjectName: mockSubjects[3].name,
    subjectColor: mockSubjects[3].color,
    lastStudied: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    cardsCount: 16,
    order: 0,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 8,
    name: "Chemické reakce",
    subjectId: mockSubjects[4].id,
    subjectName: mockSubjects[4].name,
    subjectColor: mockSubjects[4].color,
    lastStudied: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    cardsCount: 14,
    order: 0,
    createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 9,
    name: "Druhá světová válka",
    subjectId: mockSubjects[5].id,
    subjectName: mockSubjects[5].name,
    subjectColor: mockSubjects[5].color,
    lastStudied: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    cardsCount: 30,
    order: 0,
    createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 10,
    name: "Česká poezie 19. století",
    subjectId: mockSubjects[6].id,
    subjectName: mockSubjects[6].name,
    subjectColor: mockSubjects[6].color,
    lastStudied: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    cardsCount: 18,
    order: 0,
    createdAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Counter for generating new IDs
let nextTopicId = 11;

// Helper to get a topic by ID
export function getMockTopicById(id: number): Topic | undefined {
  return mockTopics.find((topic) => topic.id === id);
}

// Helper to get topics by subject ID
export function getMockTopicsBySubjectId(subjectId: number): Topic[] {
  return mockTopics.filter((topic) => topic.subjectId === subjectId);
}

// Helper to create a new mock topic
export function createMockTopic(
  data: Omit<
    Topic,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "subjectName"
    | "subjectColor"
    | "cardsCount"
    | "lastStudied"
  >
): Topic {
  const subject = mockSubjects.find((s) => s.id === data.subjectId);
  return {
    id: nextTopicId++,
    ...data,
    subjectName: subject?.name || "Unknown Subject",
    subjectColor: subject?.color,
    cardsCount: 0,
    order: data.order || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
