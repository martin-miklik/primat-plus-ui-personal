import { Material } from "@/lib/validations/material";

export const mockMaterials: Material[] = [
  // Calculus materials
  {
    id: "m1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
    topicId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    name: "Introduction to Limits",
    type: "pdf",
    fileUrl: "https://example.com/files/limits.pdf",
    fileSize: 2048000,
    processingStatus: "completed",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    flashcardsCount: 15,
    testsCount: 2,
  },
  {
    id: "m2b3c4d5-e6f7-8a9b-0c1d-2e3f4a5b6c7d",
    topicId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    name: "Derivatives Basics",
    type: "docx",
    fileUrl: "https://example.com/files/derivatives.docx",
    fileSize: 1536000,
    processingStatus: "completed",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    flashcardsCount: 12,
    testsCount: 1,
  },
  // Linear Algebra materials
  {
    id: "m3c4d5e6-f7a8-9b0c-1d2e-3f4a5b6c7d8e",
    topicId: "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
    name: "Matrix Operations",
    type: "pdf",
    fileUrl: "https://example.com/files/matrices.pdf",
    fileSize: 3072000,
    processingStatus: "completed",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    flashcardsCount: 20,
    testsCount: 3,
  },
  // Mechanics materials
  {
    id: "m4d5e6f7-a8b9-0c1d-2e3f-4a5b6c7d8e9f",
    topicId: "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f",
    name: "Newton's Laws",
    type: "note",
    content: "Three fundamental laws of motion...",
    processingStatus: "completed",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    flashcardsCount: 8,
    testsCount: 1,
  },
  {
    id: "m5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a",
    topicId: "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f",
    name: "Force and Motion",
    type: "pdf",
    fileUrl: "https://example.com/files/force-motion.pdf",
    fileSize: 2560000,
    processingStatus: "completed",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    flashcardsCount: 10,
    testsCount: 2,
  },
  // Data Structures materials
  {
    id: "m6f7a8b9-c0d1-2e3f-4a5b-6c7d8e9f0a1b",
    topicId: "e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b",
    name: "Arrays and Lists",
    type: "txt",
    fileUrl: "https://example.com/files/arrays-lists.txt",
    fileSize: 512000,
    processingStatus: "completed",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    flashcardsCount: 18,
    testsCount: 2,
  },
  {
    id: "m7a8b9c0-d1e2-3f4a-5b6c-7d8e9f0a1b2c",
    topicId: "e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b",
    name: "Trees and Graphs",
    type: "pdf",
    fileUrl: "https://example.com/files/trees-graphs.pdf",
    fileSize: 4096000,
    processingStatus: "processing",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    flashcardsCount: 0,
    testsCount: 0,
  },
  // Algorithms materials
  {
    id: "m8b9c0d1-e2f3-4a5b-6c7d-8e9f0a1b2c3d",
    topicId: "f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c",
    name: "Sorting Algorithms",
    type: "pdf",
    fileUrl: "https://example.com/files/sorting.pdf",
    fileSize: 1024000,
    processingStatus: "completed",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    flashcardsCount: 14,
    testsCount: 3,
  },
];

export function getMockMaterialById(id: string): Material | undefined {
  return mockMaterials.find((material) => material.id === id);
}

export function getMockMaterialsByTopicId(topicId: string): Material[] {
  return mockMaterials.filter((material) => material.topicId === topicId);
}

export function createMockMaterial(
  data: Omit<
    Material,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "flashcardsCount"
    | "testsCount"
    | "processingStatus"
  >
): Material {
  return {
    id: crypto.randomUUID(),
    ...data,
    processingStatus: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    flashcardsCount: 0,
    testsCount: 0,
  };
}
