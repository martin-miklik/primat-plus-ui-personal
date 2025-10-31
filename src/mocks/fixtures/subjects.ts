import { Subject } from "@/lib/validations/subject";

export const mockSubjects: Subject[] = [
  {
    id: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    name: "Matematika",
    description: "Pokročilá matematika a kalkulus",
    color: "#3B82F6",
    icon: "📐",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    topicsCount: 12,
    materialsCount: 15,
  },
  {
    id: "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
    name: "Fyzika",
    description: "Klasická a moderní fyzika",
    color: "#10B981",
    icon: "⚛️",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    topicsCount: 17,
    materialsCount: 15,
  },
  {
    id: "3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
    name: "Informatika",
    description: "Algoritmy, datové struktury a programování",
    color: "#8B5CF6",
    icon: "💻",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    topicsCount: 12,
    materialsCount: 16,
  },
  {
    id: "4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
    name: "Biologie",
    description: "Molekulární biologie a genetika",
    color: "#F59E0B",
    icon: "🧬",
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    topicsCount: 12,
    materialsCount: 15,
  },
  {
    id: "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
    name: "Chemie",
    description: "Organická a anorganická chemie",
    color: "#EF4444",
    icon: "⚗️",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    topicsCount: 12,
    materialsCount: 15,
  },
  {
    id: "6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c",
    name: "Dějepis",
    description: "Světové dějiny a civilizace",
    color: "#A855F7",
    icon: "📜",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    topicsCount: 15,
    materialsCount: 15,
  },
  {
    id: "7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
    name: "Literatura",
    description: "Klasická a moderní literatura",
    color: "#EC4899",
    icon: "📚",
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    topicsCount: 12,
    materialsCount: 15,
  },
  {
    id: "8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e",
    name: "Ekonomie",
    description: "Mikro a makroekonomie",
    color: "#14B8A6",
    icon: "💰",
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    topicsCount: 12,
    materialsCount: 15,
  },
];

// Helper to get a subject by ID
export function getMockSubjectById(id: string): Subject | undefined {
  return mockSubjects.find((subject) => subject.id === id);
}

// Helper to create a new mock subject
export function createMockSubject(
  data: Omit<
    Subject,
    "id" | "createdAt" | "updatedAt" | "topicsCount" | "materialsCount"
  >
): Subject {
  return {
    id: crypto.randomUUID(),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    topicsCount: 0,
    materialsCount: 0,
  };
}
