import { Subject } from "@/lib/validations/subject";

export const mockSubjects: Subject[] = [
  {
    id: 1,
    name: "Matematika",
    description: "Pokročilá matematika a kalkulus",
    color: "#3B82F6",
    icon: "📐",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    topicsCount: 12,
    sourcesCount: 15,
  },
  {
    id: 2,
    name: "Fyzika",
    description: "Klasická a moderní fyzika",
    color: "#10B981",
    icon: "⚛️",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    topicsCount: 17,
    sourcesCount: 15,
  },
  {
    id: 3,
    name: "Informatika",
    description: "Algoritmy, datové struktury a programování",
    color: "#8B5CF6",
    icon: "💻",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    topicsCount: 12,
    sourcesCount: 16,
  },
  {
    id: 4,
    name: "Biologie",
    description: "Molekulární biologie a genetika",
    color: "#F59E0B",
    icon: "🧬",
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    topicsCount: 12,
    sourcesCount: 15,
  },
  {
    id: 5,
    name: "Chemie",
    description: "Organická a anorganická chemie",
    color: "#EF4444",
    icon: "⚗️",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    topicsCount: 12,
    sourcesCount: 15,
  },
  {
    id: 6,
    name: "Dějepis",
    description: "Světové dějiny a civilizace",
    color: "#A855F7",
    icon: "📜",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    topicsCount: 15,
    sourcesCount: 15,
  },
  {
    id: 7,
    name: "Literatura",
    description: "Klasická a moderní literatura",
    color: "#EC4899",
    icon: "📚",
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    topicsCount: 12,
    sourcesCount: 15,
  },
  {
    id: 8,
    name: "Ekonomie",
    description: "Mikro a makroekonomie",
    color: "#14B8A6",
    icon: "💰",
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    topicsCount: 12,
    sourcesCount: 15,
  },
];

// Counter for generating new IDs
let nextId = 9;

// Helper to get a subject by ID
export function getMockSubjectById(id: number): Subject | undefined {
  return mockSubjects.find((subject) => subject.id === id);
}

// Helper to create a new mock subject
export function createMockSubject(
  data: Omit<
    Subject,
    "id" | "createdAt" | "updatedAt" | "topicsCount" | "sourcesCount"
  >
): Subject {
  return {
    id: nextId++,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    topicsCount: 0,
    sourcesCount: 0,
  };
}
