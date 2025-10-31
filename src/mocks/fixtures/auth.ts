import { User } from "@/lib/validations/auth";

export const mockUsers: User[] = [
  {
    id: "u1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
    email: "john@example.com",
    name: "John Doe",
    subscription: "premium",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "u2b3c4d5-e6f7-8a9b-0c1d-2e3f4a5b6c7d",
    email: "jane@example.com",
    name: "Jane Smith",
    subscription: "free",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "u3c4d5e6-f7a8-9b0c-1d2e-3f4a5b6c7d8e",
    email: "test@example.com",
    name: "Test User",
    subscription: "free",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock credentials (for testing purposes)
export const mockCredentials = {
  "john@example.com": "Password123",
  "jane@example.com": "Password123",
  "test@example.com": "Password123",
};

export function getMockUserByEmail(email: string): User | undefined {
  return mockUsers.find((user) => user.email === email);
}

export function validateMockCredentials(
  email: string,
  password: string
): boolean {
  return mockCredentials[email as keyof typeof mockCredentials] === password;
}

export function generateMockToken(userId: string): string {
  // Simple mock token (in real app, use JWT)
  return `mock_token_${userId}_${Date.now()}`;
}
