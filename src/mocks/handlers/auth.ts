import { http, HttpResponse, delay } from "msw";
import {
  mockUsers,
  getMockUserByEmail,
  validateMockCredentials,
  generateMockToken,
} from "@/mocks/fixtures/auth";
import { User } from "@/lib/validations/auth";
import { apiPath } from "@/mocks/config";

const users = [...mockUsers];

export const authHandlers = [
  // POST /api/v1/auth/register - Register new user
  http.post(apiPath("/auth/register"), async ({ request }) => {
    await delay(500);

    const body = (await request.json()) as Record<string, unknown>;

    if (!body.email || typeof body.email !== "string") {
      return HttpResponse.json(
        { error: "E-mail je povinný", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    if (!body.password || typeof body.password !== "string") {
      return HttpResponse.json(
        { error: "Heslo je povinné", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    if (!body.name || typeof body.name !== "string") {
      return HttpResponse.json(
        { error: "Jméno je povinné", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = users.find((u) => u.email === body.email);
    if (existingUser) {
      return HttpResponse.json(
        { error: "E-mail je již registrován", code: "EMAIL_EXISTS" },
        { status: 409 }
      );
    }

    const newUser: User = {
      id: users.length + 1,
      email: body.email,
      name: body.name,
      nickname: body.name,
      externalId: `ext_${crypto.randomUUID()}`,
      subscriptionType: "free",
      subscriptionExpiresAt: null,
      hasActiveSubscription: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);

    const token = generateMockToken(newUser.id);

    return HttpResponse.json(
      {
        data: {
          user: newUser,
          token,
        },
        message: "Registrace byla úspěšná",
      },
      { status: 201 }
    );
  }),

  // POST /api/v1/auth/login - Login user
  http.post(apiPath("/auth/login"), async ({ request }) => {
    await delay(400);

    const body = (await request.json()) as Record<string, unknown>;

    // Support both 'email' and 'login' fields
    const login = (body.login || body.email) as string;
    const password = body.password as string;

    if (!login || typeof login !== "string") {
      return HttpResponse.json(
        { error: "E-mail/login je povinný", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return HttpResponse.json(
        { error: "Heslo je povinné", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const user = getMockUserByEmail(login);

    if (!user || !validateMockCredentials(login, password)) {
      return HttpResponse.json(
        { error: "Neplatný e-mail nebo heslo", code: "INVALID_CREDENTIALS" },
        { status: 401 }
      );
    }

    const token = generateMockToken(user.id);

    // Return in MSW format with data wrapper (for compatibility)
    return HttpResponse.json({
      data: {
        user,
        token,
      },
      message: "Přihlášení bylo úspěšné",
    });
  }),

  // POST /api/v1/auth/logout - Logout user
  http.post(apiPath("/auth/logout"), async () => {
    await delay(200);

    return HttpResponse.json({
      message: "Odhlášení bylo úspěšné",
    });
  }),

  // GET /api/v1/auth/me - Get current user
  http.get(apiPath("/auth/me"), async ({ request }) => {
    await delay(200);

    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json(
        { error: "Neautorizováno", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // Extract token and validate
    const token = authHeader.replace("Bearer ", "");

    // Parse user ID from mock token format: mock_token_{userId}_{timestamp}
    const tokenMatch = token.match(/^mock_token_([^_]+)_(\d+)$/);

    if (!tokenMatch) {
      return HttpResponse.json(
        { error: "Neplatný token", code: "INVALID_TOKEN" },
        { status: 401 }
      );
    }

    const [, userId, timestamp] = tokenMatch;

    // Check if token is expired (24 hours = 86400000 ms)
    const tokenAge = Date.now() - parseInt(timestamp, 10);
    const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

    if (tokenAge > TOKEN_EXPIRY) {
      return HttpResponse.json(
        { error: "Token vypršel", code: "TOKEN_EXPIRED" },
        { status: 401 }
      );
    }

    // Find user by ID from token (convert userId string to number)
    const user = users.find((u) => u.id === parseInt(userId, 10));

    if (!user) {
      return HttpResponse.json(
        { error: "Uživatel nenalezen", code: "USER_NOT_FOUND" },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      data: user,
    });
  }),

  // PATCH /api/v1/auth/me - Update current user
  http.patch(apiPath("/auth/me"), async ({ request }) => {
    await delay(300);

    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json(
        { error: "Neautorizováno", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;

    // For mock purposes, update first user
    const userIndex = 0;
    const updatedUser: User = {
      ...users[userIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    users[userIndex] = updatedUser;

    return HttpResponse.json({
      data: updatedUser,
      message: "Profil byl úspěšně aktualizován",
    });
  }),
];
