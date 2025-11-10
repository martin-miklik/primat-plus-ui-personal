import { http, HttpResponse, delay } from "msw";
import {
  mockTests,
  mockTestInstances,
  mockUserAnswers,
  generateMockTestId,
  generateMockInstanceId,
  generateMockAnswerId,
  getMockTestListItems,
} from "@/mocks/fixtures/tests";
import { getMockSourceById } from "@/mocks/fixtures/sources";
import {
  Test,
  TestInstance,
  TestConfiguration,
  Question,
  FrontendQuestion,
  QuestionResult,
} from "@/lib/validations/test";
import { apiPath } from "@/mocks/config";

// In-memory stores
const tests = [...mockTests];
const testInstances = [...mockTestInstances];
const userAnswers = [...mockUserAnswers];

// Helper to generate mock questions based on configuration
function generateMockQuestions(config: TestConfiguration): Question[] {
  const questions: Question[] = [];
  const typesPool = config.questionTypes;

  for (let i = 0; i < config.questionCount; i++) {
    const type = typesPool[i % typesPool.length];

    if (type === "multiple_choice_single") {
      questions.push({
        type: "multiple_choice_single",
        question: `Otázka ${i + 1}: Testovací otázka (MC single)`,
        options: [
          { id: "a", text: "Možnost A" },
          { id: "b", text: "Možnost B" },
          { id: "c", text: "Možnost C" },
          { id: "d", text: "Možnost D" },
        ],
        correctAnswer: ["a", "b", "c", "d"][i % 4],
        explanation: `Vysvětlení pro otázku ${i + 1}`,
      });
    } else if (type === "multiple_choice_multiple") {
      questions.push({
        type: "multiple_choice_multiple",
        question: `Otázka ${i + 1}: Testovací otázka (MC multiple)`,
        options: [
          { id: "a", text: "Možnost A" },
          { id: "b", text: "Možnost B" },
          { id: "c", text: "Možnost C" },
          { id: "d", text: "Možnost D" },
        ],
        correctAnswer: ["a", "b"],
        explanation: `Vysvětlení pro otázku ${i + 1}`,
      });
    } else if (type === "true_false") {
      questions.push({
        type: "true_false",
        question: `Otázka ${i + 1}: Testovací otázka (True/False)`,
        options: [
          { id: "true", text: "Pravda" },
          { id: "false", text: "Nepravda" },
        ],
        correctAnswer: i % 2 === 0 ? "true" : "false",
        explanation: `Vysvětlení pro otázku ${i + 1}`,
      });
    } else if (type === "open_ended") {
      questions.push({
        type: "open_ended",
        question: `Otázka ${i + 1}: Testovací otázka (Open-ended)`,
        options: null,
        correctAnswer: `Vzorová odpověď pro otázku ${i + 1}`,
        explanation: `Vysvětlení pro otázku ${i + 1}`,
      });
    }
  }

  return questions;
}

// Helper to strip sensitive data from questions
function sanitizeQuestionsForFrontend(questions: Question[]): FrontendQuestion[] {
  return questions.map((q, index) => ({
    index,
    type: q.type,
    question: q.question,
    options: q.options,
  }));
}

// Helper to check answer correctness
function checkAnswer(
  question: Question,
  answer: string | string[] | boolean
): boolean {
  const correctAnswer = question.correctAnswer;

  if (question.type === "multiple_choice_multiple") {
    if (!Array.isArray(answer) || !Array.isArray(correctAnswer)) return false;
    const sortedAnswer = [...answer].sort();
    const sortedCorrect = [...correctAnswer].sort();
    return (
      sortedAnswer.length === sortedCorrect.length &&
      sortedAnswer.every((val, idx) => val === sortedCorrect[idx])
    );
  }

  return answer === correctAnswer;
}

// Helper to generate AI feedback for open-ended questions
function generateAIFeedback(
  studentAnswer: string,
  correctAnswer: string
): { score: number; isCorrect: boolean; feedback: string } {
  // Simple mock evaluation based on length and keyword matching
  const studentWords = studentAnswer.toLowerCase().split(/\s+/);
  const correctWords = correctAnswer.toLowerCase().split(/\s+/);
  const matchingWords = studentWords.filter((word) =>
    correctWords.includes(word)
  );
  const matchRatio = matchingWords.length / correctWords.length;

  const score = Math.min(matchRatio * 1.5, 1);
  const isCorrect = score >= 0.7;
  let feedback = "";

  if (score >= 0.9) {
    feedback =
      "Výborná odpověď! Postihli jste všechny klíčové body a odpověď je velmi přesná.";
  } else if (score >= 0.7) {
    feedback =
      "Dobrá odpověď. Většinu klíčových bodů jste zachytili, ale mohli byste být detailnější.";
  } else if (score >= 0.5) {
    feedback =
      "Vaše odpověď obsahuje některé správné body, ale chybí důležité detaily. Doporučuji se vrátit k materiálu.";
  } else {
    feedback =
      "Vaše odpověď bohužel není dostatečně přesná. Chybí většina klíčových konceptů. Projděte si prosím studijní materiál znovu.";
  }

  return { score, isCorrect, feedback };
}

export const testsHandlers = [
  // POST /api/sources/:sourceId/tests - Generate new test
  http.post(apiPath("/sources/:sourceId/tests"), async ({ params, request }) => {
    await delay(500);

    const sourceId = Number(params.sourceId);
    const config = (await request.json()) as TestConfiguration;

    // Validate source exists
    const source = getMockSourceById(sourceId);
    if (!source) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Zdroj nenalezen",
            status: 404,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        { status: 404 }
      );
    }

    // Validate source is processed
    if (source.status !== "processed") {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_STATE",
            message: "Zdroj ještě není zpracován",
            status: 409,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        { status: 409 }
      );
    }

    // Create new test with generating status
    const testId = generateMockTestId();
    const newTest: Test = {
      id: testId,
      sourceId,
      userId: 1,
      questionCount: config.questionCount,
      difficulty: config.difficulty,
      questionTypes: config.questionTypes,
      reviewMode: config.reviewMode,
      generatedQuestions: [],
      status: "generating",
      generationError: null,
      aiGenerationTimeMs: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tests.push(newTest);

    // Simulate async generation - update test status after delay
    setTimeout(() => {
      const test = tests.find((t) => t.id === testId);
      if (test) {
        test.status = "ready";
        test.generatedQuestions = generateMockQuestions(config);
        test.aiGenerationTimeMs = 2000 + Math.random() * 2000;
        test.updatedAt = new Date().toISOString();
      }
    }, 2500);

    return HttpResponse.json(
      {
        success: true,
        data: {
          testId: newTest.id,
          status: newTest.status,
        },
        timestamp: new Date().toISOString(),
        version: "v1",
      },
      { status: 201 }
    );
  }),

  // GET /api/sources/:sourceId/tests - List tests for source
  http.get(apiPath("/sources/:sourceId/tests"), async ({ params }) => {
    await delay(300);

    const sourceId = Number(params.sourceId);
    const testList = getMockTestListItems(sourceId);

    return HttpResponse.json({
      success: true,
      data: testList,
      timestamp: new Date().toISOString(),
      version: "v1",
    });
  }),

  // GET /api/tests/:testId - Get single test
  http.get(apiPath("/tests/:testId"), async ({ params }) => {
    await delay(200);

    const testId = params.testId as string;
    const test = tests.find((t) => t.id === testId);

    if (!test) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Test nenalezen",
            status: 404,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: test,
      timestamp: new Date().toISOString(),
      version: "v1",
    });
  }),

  // POST /api/tests/:testId/instances - Start test (create instance)
  http.post(apiPath("/tests/:testId/instances"), async ({ params }) => {
    await delay(400);

    const testId = params.testId as string;
    const test = tests.find((t) => t.id === testId);

    if (!test) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Test nenalezen",
            status: 404,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        { status: 404 }
      );
    }

    if (test.status !== "ready") {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_STATE",
            message:
              test.status === "generating"
                ? "Test se stále generuje"
                : "Test není připraven",
            status: 409,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        { status: 409 }
      );
    }

    // Check for active instance (limit 1 per user per test)
    const activeInstance = testInstances.find(
      (inst) =>
        inst.testId === testId && inst.userId === 1 && inst.status === "active"
    );

    if (activeInstance) {
      // Return the existing instance instead of error
      const sanitizedQuestions = sanitizeQuestionsForFrontend(
        test.generatedQuestions
      );

      return HttpResponse.json(
        {
          success: true,
          data: {
            instanceId: activeInstance.id,
            testId: activeInstance.testId,
            status: activeInstance.status,
            reviewMode: test.reviewMode,
            questions: sanitizedQuestions,
            startedAt: activeInstance.startedAt,
            expiresAt: activeInstance.expiresAt,
            resumed: true, // Flag to indicate this is a resumed instance
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        { status: 200 }
      );
    }

    // Create new instance
    const instanceId = generateMockInstanceId();
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + 60 * 60 * 1000); // 1 hour

    const newInstance: TestInstance = {
      id: instanceId,
      testId,
      userId: 1,
      status: "active",
      score: null,
      totalQuestions: test.questionCount,
      percentage: null,
      startedAt: startedAt.toISOString(),
      completedAt: null,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    testInstances.push(newInstance);

    // Sanitize questions (remove correct answers)
    const sanitizedQuestions = sanitizeQuestionsForFrontend(
      test.generatedQuestions
    );

    return HttpResponse.json(
      {
        success: true,
        data: {
          instanceId: newInstance.id,
          testId: newInstance.testId,
          status: newInstance.status,
          reviewMode: test.reviewMode,
          questions: sanitizedQuestions,
          startedAt: newInstance.startedAt,
          expiresAt: newInstance.expiresAt,
        },
        timestamp: new Date().toISOString(),
        version: "v1",
      },
      { status: 201 }
    );
  }),

  // GET /api/instances/:instanceId - Get instance details
  http.get(apiPath("/instances/:instanceId"), async ({ params }) => {
    await delay(200);

    const instanceId = params.instanceId as string;
    const instance = testInstances.find((inst) => inst.id === instanceId);

    if (!instance) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Instance testu nenalezena",
            status: 404,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        { status: 404 }
      );
    }

    const test = tests.find((t) => t.id === instance.testId);
    if (!test) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Test nenalezen",
            status: 404,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        { status: 404 }
      );
    }

    // Sanitize questions (remove correct answers)
    const sanitizedQuestions = sanitizeQuestionsForFrontend(
      test.generatedQuestions
    );

    return HttpResponse.json({
      success: true,
      data: {
        instanceId: instance.id,
        testId: instance.testId,
        status: instance.status,
        reviewMode: test.reviewMode,
        questions: sanitizedQuestions,
        startedAt: instance.startedAt,
        expiresAt: instance.expiresAt,
      },
      timestamp: new Date().toISOString(),
      version: "v1",
    });
  }),

  // POST /api/instances/:instanceId/answers - Submit answer
  http.post(
    apiPath("/instances/:instanceId/answers"),
    async ({ params, request }) => {
      await delay(300);

      const instanceId = params.instanceId as string;
      const body = (await request.json()) as {
        questionIndex: number;
        answer: string | string[] | boolean;
      };

      const instance = testInstances.find((inst) => inst.id === instanceId);

      if (!instance) {
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "Instance testu nenalezena",
              status: 404,
            },
            timestamp: new Date().toISOString(),
            version: "v1",
          },
          { status: 404 }
        );
      }

      if (instance.status !== "active") {
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_STATE",
              message: "Test není aktivní",
              status: 410,
            },
            timestamp: new Date().toISOString(),
            version: "v1",
          },
          { status: 410 }
        );
      }

      const test = tests.find((t) => t.id === instance.testId);
      if (!test) {
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "Test nenalezen",
              status: 404,
            },
            timestamp: new Date().toISOString(),
            version: "v1",
          },
          { status: 404 }
        );
      }

      const question = test.generatedQuestions[body.questionIndex];
      if (!question) {
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_INPUT",
              message: "Neplatný index otázky",
              status: 400,
            },
            timestamp: new Date().toISOString(),
            version: "v1",
          },
          { status: 400 }
        );
      }

      // Find or create user answer
      let userAnswer = userAnswers.find(
        (ans) =>
          ans.instanceId === instanceId &&
          ans.questionIndex === body.questionIndex
      );

      if (!userAnswer) {
        userAnswer = {
          id: generateMockAnswerId(),
          instanceId,
          questionIndex: body.questionIndex,
          answer: body.answer,
          isCorrect: null,
          score: null,
          aiFeedback: null,
          answeredAt: new Date().toISOString(),
          evaluatedAt: null,
        };
        userAnswers.push(userAnswer);
      } else {
        // Update existing answer
        userAnswer.answer = body.answer;
        userAnswer.answeredAt = new Date().toISOString();
      }

      // Handle review mode
      if (test.reviewMode === "after") {
        // Just save, don't evaluate
        return HttpResponse.json({
          success: true,
          data: {
            success: true,
            saved: true,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        });
      }

      // Review mode is "during" - evaluate immediately
      if (question.type === "open_ended") {
        // For open-ended, simulate async evaluation
        const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        // Simulate AI evaluation after delay
        setTimeout(() => {
          const evaluation = generateAIFeedback(
            body.answer as string,
            question.correctAnswer as string
          );
          userAnswer!.score = evaluation.score;
          userAnswer!.isCorrect = evaluation.isCorrect;
          userAnswer!.aiFeedback = evaluation.feedback;
          userAnswer!.evaluatedAt = new Date().toISOString();
        }, 2000);

        return HttpResponse.json({
          success: true,
          data: {
            success: true,
            jobId,
            message: "Vyhodnocuji tvou odpověď pomocí AI...",
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        });
      }

      // For MC/TF questions, evaluate immediately
      const isCorrect = checkAnswer(question, body.answer);
      userAnswer.isCorrect = isCorrect;
      userAnswer.score = isCorrect ? 1.0 : 0.0;
      userAnswer.evaluatedAt = new Date().toISOString();

      return HttpResponse.json({
        success: true,
        data: {
          success: true,
          isCorrect,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
        },
        timestamp: new Date().toISOString(),
        version: "v1",
      });
    }
  ),

  // POST /api/instances/:instanceId/complete - Complete test
  http.post(apiPath("/instances/:instanceId/complete"), async ({ params }) => {
    await delay(500);

    const instanceId = params.instanceId as string;
    const instance = testInstances.find((inst) => inst.id === instanceId);

    if (!instance) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Instance testu nenalezena",
            status: 404,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        { status: 404 }
      );
    }

    if (instance.status !== "active") {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_STATE",
            message: "Test již není aktivní",
            status: 410,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        { status: 410 }
      );
    }

    const test = tests.find((t) => t.id === instance.testId);
    if (!test) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Test nenalezen",
            status: 404,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        { status: 404 }
      );
    }

    const instanceAnswers = userAnswers.filter(
      (ans) => ans.instanceId === instanceId
    );

    // Check if all questions are answered
    if (instanceAnswers.length < test.questionCount) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_STATE",
            message: "Nebyly zodpovězeny všechny otázky",
            status: 400,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        { status: 400 }
      );
    }

    // Evaluate unevaluated answers (for "after" mode)
    let evaluatingCount = 0;
    let score = 0;

    instanceAnswers.forEach((answer) => {
      const question = test.generatedQuestions[answer.questionIndex];

      if (answer.evaluatedAt === null) {
        if (question.type === "open_ended") {
          evaluatingCount++;
          // Would normally dispatch job here
        } else {
          // Evaluate now
          const isCorrect = checkAnswer(question, answer.answer);
          answer.isCorrect = isCorrect;
          answer.score = isCorrect ? 1.0 : 0.0;
          answer.evaluatedAt = new Date().toISOString();
        }
      }

      if (answer.score !== null && answer.isCorrect) {
        score++;
      }
    });

    // Update instance
    const completedAt = new Date();
    const percentage = (score / test.questionCount) * 100;

    instance.status = "completed";
    instance.score = score;
    instance.percentage = percentage;
    instance.completedAt = completedAt.toISOString();
    instance.updatedAt = new Date().toISOString();

    return HttpResponse.json({
      success: true,
      data: {
        success: true,
        instanceId: instance.id,
        score,
        totalQuestions: test.questionCount,
        percentage,
        evaluatingCount,
        completedAt: completedAt.toISOString(),
      },
      timestamp: new Date().toISOString(),
      version: "v1",
    });
  }),

  // GET /api/instances/:instanceId/results - Get test results
  http.get(apiPath("/instances/:instanceId/results"), async ({ params }) => {
    await delay(300);

    const instanceId = params.instanceId as string;
    const instance = testInstances.find((inst) => inst.id === instanceId);

    if (!instance) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Instance testu nenalezena",
            status: 404,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        { status: 404 }
      );
    }

    if (instance.status !== "completed") {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_STATE",
            message: "Test ještě není dokončen",
            status: 403,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        { status: 403 }
      );
    }

    const test = tests.find((t) => t.id === instance.testId);
    if (!test) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Test nenalezen",
            status: 404,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        { status: 404 }
      );
    }

    const instanceAnswers = userAnswers.filter(
      (ans) => ans.instanceId === instanceId
    );

    // Build results
    const results: QuestionResult[] = test.generatedQuestions.map(
      (question, index) => {
        const userAnswer = instanceAnswers.find(
          (ans) => ans.questionIndex === index
        );

        return {
          questionIndex: index,
          type: question.type,
          question: question.question,
          options: question.options,
          studentAnswer: userAnswer?.answer ?? null,
          correctAnswer: question.correctAnswer,
          isCorrect: userAnswer?.isCorrect ?? false,
          explanation: question.explanation,
          score: userAnswer?.score ?? null,
          aiFeedback: userAnswer?.aiFeedback ?? null,
        };
      }
    );

    // Count still evaluating
    const evaluatingCount = results.filter(
      (r) => r.type === "open_ended" && r.score === null
    ).length;

    return HttpResponse.json({
      success: true,
      data: {
        instanceId: instance.id,
        testId: instance.testId,
        score: instance.score ?? 0,
        totalQuestions: instance.totalQuestions,
        percentage: instance.percentage ?? 0,
        completedAt: instance.completedAt ?? new Date().toISOString(),
        evaluatingCount,
        results,
      },
      timestamp: new Date().toISOString(),
      version: "v1",
    });
  }),

  // GET /api/tests/:testId/status - Check test generation status (for polling)
  http.get(apiPath("/tests/:testId/status"), async ({ params }) => {
    await delay(100);

    const testId = params.testId as string;
    const test = tests.find((t) => t.id === testId);

    if (!test) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Test nenalezen",
            status: 404,
          },
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        testId: test.id,
        status: test.status,
        generationError: test.generationError,
      },
      timestamp: new Date().toISOString(),
      version: "v1",
    });
  }),
];
