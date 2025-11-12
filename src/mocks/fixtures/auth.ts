import { User } from "@/lib/validations/auth";

export const mockUsers: User[] = [
  {
    id: 1,
    email: "john@example.com",
    name: "John Doe",
    nickname: "johnny",
    externalId: "ext_john_123",
    subscriptionType: "premium",
    subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    hasActiveSubscription: true,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    email: "jane@example.com",
    name: "Jane Smith",
    nickname: "janesmith",
    externalId: "ext_jane_456",
    subscriptionType: "free",
    subscriptionExpiresAt: null,
    hasActiveSubscription: false,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    email: "test@example.com",
    name: "Test User",
    nickname: "testuser",
    externalId: "ext_test_789",
    subscriptionType: "free",
    subscriptionExpiresAt: null,
    hasActiveSubscription: false,
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

export function generateMockToken(userId: number): string {
  // Simple mock token (in real app, use JWT)
  return `mock_token_${userId}_${Date.now()}`;
}
