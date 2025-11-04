import { http, HttpResponse, delay } from "msw";
import {
  mockTests,
  mockTestAttempts,
  createMockTest,
} from "@/mocks/fixtures/tests";
import { Test, TestAttempt } from "@/lib/validations/test";
import { apiPath } from "@/mocks/config";

const tests = [...mockTests];
const testAttempts = [...mockTestAttempts];

function calculateScore(
  test: Test,
  answers: Record<string, string>
): { score: number; passed: boolean } {
  let earnedPoints = 0;
  let totalPoints = 0;

  test.questions.forEach((question) => {
    totalPoints += question.points;
    const userAnswer = answers[question.id]?.trim().toLowerCase();
    const correctAnswer = question.correctAnswer.trim().toLowerCase();

    if (userAnswer === correctAnswer) {
      earnedPoints += question.points;
    }
  });

  const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
  const passed = score >= test.passingScore;

  return { score: Math.round(score), passed };
}

export const testsHandlers = [
  // GET /api/v1/sources/:sourceId/tests - List tests for a source
  http.get(apiPath("/sources/:sourceId/tests"), async ({ params }) => {
    await delay(250);

    const { sourceId } = params;
    const sourceTests = tests.filter((t) => t.sourceId === Number(sourceId));

    return HttpResponse.json({
      data: sourceTests,
      total: sourceTests.length,
    });
  }),

  // GET /api/v1/tests/:id - Get single test
  http.get(apiPath("/tests/:id"), async ({ params }) => {
    await delay(200);

    const { id } = params;
    const test = tests.find((t) => t.id === id);

    if (!test) {
      return HttpResponse.json(
        { error: "Test nenalezen", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: test });
  }),

  // POST /api/v1/sources/:sourceId/tests - Create new test
  http.post(
    apiPath("/sources/:sourceId/tests"),
    async ({ params, request }) => {
      await delay(500);

      const { sourceId } = params;
      const body = (await request.json()) as Record<string, unknown>;

      if (!body.name || typeof body.name !== "string") {
        return HttpResponse.json(
          { error: "Název testu je povinný", code: "VALIDATION_ERROR" },
          { status: 400 }
        );
      }

      if (!Array.isArray(body.questions) || body.questions.length === 0) {
        return HttpResponse.json(
          {
            error: "Test musí obsahovat alespoň jednu otázku",
            code: "VALIDATION_ERROR",
          },
          { status: 400 }
        );
      }

      const newTest = createMockTest({
        sourceId: Number(sourceId),
        name: body.name,
        description: body.description as string | undefined,
        questions: body.questions as Test["questions"],
        timeLimit: body.timeLimit as number | undefined,
        passingScore: (body.passingScore as number) || 70,
      });

      tests.push(newTest);

      return HttpResponse.json(
        { data: newTest, message: "Test byl úspěšně vytvořen" },
        { status: 201 }
      );
    }
  ),

  // POST /api/v1/tests/:id/submit - Submit test answers
  http.post(apiPath("/tests/:id/submit"), async ({ params, request }) => {
    await delay(500);

    const { id } = params;
    const body = (await request.json()) as Record<string, unknown>;
    const test = tests.find((t) => t.id === id);

    if (!test) {
      return HttpResponse.json(
        { error: "Test nenalezen", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const answers = body.answers as Record<string, string>;
    const timeSpent = body.timeSpent as number;

    if (!answers || typeof answers !== "object") {
      return HttpResponse.json(
        { error: "Odpovědi jsou povinné", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const { score, passed } = calculateScore(test, answers);

    const attempt: TestAttempt = {
      id: crypto.randomUUID(),
      testId: test.id,
      userId: "u1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c", // Mock user
      answers,
      score,
      passed,
      startedAt: new Date(Date.now() - (timeSpent || 0) * 1000).toISOString(),
      completedAt: new Date().toISOString(),
      timeSpent,
    };

    testAttempts.push(attempt);

    // Update test attempts count
    const testIndex = tests.findIndex((t) => t.id === id);
    if (testIndex !== -1) {
      tests[testIndex].attemptsCount += 1;
    }

    return HttpResponse.json({
      data: attempt,
      message: passed
        ? "Gratulujeme! Úspěšně jste prošli testem!"
        : "Pokračujte ve studiu a zkuste to znovu!",
    });
  }),

  // GET /api/v1/tests/:id/attempts - Get attempts for a test
  http.get(apiPath("/tests/:id/attempts"), async ({ params }) => {
    await delay(250);

    const { id } = params;
    const attempts = testAttempts.filter((a) => a.testId === id);

    return HttpResponse.json({
      data: attempts,
      total: attempts.length,
    });
  }),

  // DELETE /api/v1/tests/:id - Delete test
  http.delete(apiPath("/tests/:id"), async ({ params }) => {
    await delay(300);

    const { id } = params;
    const testIndex = tests.findIndex((t) => t.id === id);

    if (testIndex === -1) {
      return HttpResponse.json(
        { error: "Test nenalezen", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    tests.splice(testIndex, 1);

    return HttpResponse.json({
      message: "Test byl úspěšně smazán",
    });
  }),
];
