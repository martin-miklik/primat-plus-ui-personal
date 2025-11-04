import { Source } from "@/lib/validations/source";

export const mockSources: Source[] = [
  // Math - Kvadratické rovnice (Topic ID: 1)
  {
    id: 1,
    topicId: 1,
    name: "Introduction to Quadratic Equations",
    type: "pdf",
    mimeType: "application/pdf",
    filePath: "/uploads/quadratic.pdf",
    fileUrl: "http://localhost:3000/uploads/quadratic.pdf",
    url: null,
    fileSize: 2048000,
    status: "completed",
    jobId: "job-1234567890-abc123",
    startTime: null,
    endTime: null,
    context: "Quadratic equations are polynomials of degree 2...",
    contextLength: 5000,
    errorMessage: null,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    flashcardsCount: 0,
    testsCount: 0,
  },
  {
    id: 2,
    topicId: 1,
    name: "Solving Quadratic Equations",
    type: "docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    filePath: "/uploads/solving-quadratic.docx",
    fileUrl: "http://localhost:3000/uploads/solving-quadratic.docx",
    url: null,
    fileSize: 1536000,
    status: "completed",
    jobId: "job-1234567891-abc124",
    startTime: null,
    endTime: null,
    context: "Methods for solving quadratic equations include...",
    contextLength: 4200,
    errorMessage: null,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    flashcardsCount: 0,
    testsCount: 0,
  },
  // Math - Derivace (Topic ID: 2)
  {
    id: 3,
    topicId: 2,
    name: "Derivatives Introduction",
    type: "pdf",
    mimeType: "application/pdf",
    filePath: "/uploads/derivatives.pdf",
    fileUrl: "http://localhost:3000/uploads/derivatives.pdf",
    url: null,
    fileSize: 3072000,
    status: "completed",
    jobId: "job-1234567892-abc125",
    startTime: null,
    endTime: null,
    context: "A derivative measures how a function changes...",
    contextLength: 6800,
    errorMessage: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    flashcardsCount: 0,
    testsCount: 0,
  },
  // Physics - Newton's Laws (Topic ID: 3)
  {
    id: 4,
    topicId: 3,
    name: "Newton's Laws of Motion",
    type: "note",
    mimeType: "text/plain",
    filePath: null,
    fileUrl: null,
    url: null,
    fileSize: null,
    status: "completed",
    jobId: null,
    startTime: null,
    endTime: null,
    context: "Newton's three laws of motion describe the relationship...",
    contextLength: 2500,
    errorMessage: null,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    flashcardsCount: 0,
    testsCount: 0,
  },
  {
    id: 5,
    topicId: 3,
    name: "Force and Motion Analysis",
    type: "pdf",
    mimeType: "application/pdf",
    filePath: "/uploads/force-motion.pdf",
    fileUrl: "http://localhost:3000/uploads/force-motion.pdf",
    url: null,
    fileSize: 2560000,
    status: "completed",
    jobId: "job-1234567893-abc126",
    startTime: null,
    endTime: null,
    context: "Understanding force and motion through practical examples...",
    contextLength: 5500,
    errorMessage: null,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    flashcardsCount: 0,
    testsCount: 0,
  },
  // CS - Sorting Algorithms (Topic ID: 5)
  {
    id: 6,
    topicId: 5,
    name: "Sorting Algorithms Overview",
    type: "txt",
    mimeType: "text/plain",
    filePath: "/uploads/sorting.txt",
    fileUrl: "http://localhost:3000/uploads/sorting.txt",
    url: null,
    fileSize: 512000,
    status: "completed",
    jobId: "job-1234567894-abc127",
    startTime: null,
    endTime: null,
    context: "Common sorting algorithms include bubble sort, quick sort...",
    contextLength: 3200,
    errorMessage: null,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    flashcardsCount: 0,
    testsCount: 0,
  },
  // CS - Data Structures (Topic ID: 6)
  {
    id: 7,
    topicId: 6,
    name: "Trees and Graphs",
    type: "pdf",
    mimeType: "application/pdf",
    filePath: "/uploads/trees-graphs.pdf",
    fileUrl: "http://localhost:3000/uploads/trees-graphs.pdf",
    url: null,
    fileSize: 4096000,
    status: "processing",
    jobId: "job-1234567895-abc128",
    startTime: null,
    endTime: null,
    context: null,
    contextLength: null,
    errorMessage: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    flashcardsCount: 0,
    testsCount: 0,
  },
  // YouTube source example
  {
    id: 8,
    topicId: 5,
    name: "Sorting Algorithms Explained (Video)",
    type: "youtube",
    mimeType: "video/youtube",
    filePath: null,
    fileUrl: null,
    url: "https://www.youtube.com/watch?v=example123",
    fileSize: null,
    status: "completed",
    jobId: "job-1234567896-abc129",
    startTime: 0,
    endTime: 600,
    context: "Video transcript: Introduction to sorting algorithms...",
    contextLength: 8500,
    errorMessage: null,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    flashcardsCount: 0,
    testsCount: 0,
  },
];

// Counter for generating new IDs
let nextSourceId = 9;

// Helper to get a source by ID
export function getMockSourceById(id: number): Source | undefined {
  return mockSources.find((source) => source.id === id);
}

// Helper to get sources by topic ID
export function getMockSourcesByTopicId(topicId: number): Source[] {
  return mockSources.filter((source) => source.topicId === topicId);
}

// Helper to create a new mock source
export function createMockSource(
  data: Omit<
    Source,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "status"
    | "jobId"
    | "context"
    | "contextLength"
    | "errorMessage"
    | "flashcardsCount"
    | "testsCount"
  >
): Source {
  return {
    id: nextSourceId++,
    ...data,
    status: "uploaded",
    jobId: `job-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    context: null,
    contextLength: null,
    errorMessage: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    flashcardsCount: 0,
    testsCount: 0,
  };
}
