import { http, HttpResponse, delay } from "msw";
import {
  mockFlashcards,
  createMockFlashcard,
} from "@/mocks/fixtures/flashcards";
import { Flashcard } from "@/lib/validations/flashcard";

const flashcards = [...mockFlashcards];

// SM-2 algorithm for spaced repetition
function calculateNextReview(
  quality: number,
  easeFactor: number,
  interval: number
): { easeFactor: number; interval: number; nextReviewAt: string } {
  let newEaseFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;

  let newInterval: number;
  if (quality < 3) {
    newInterval = 1;
  } else {
    if (interval === 0) {
      newInterval = 1;
    } else if (interval === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEaseFactor);
    }
  }

  const nextReviewAt = new Date(
    Date.now() + newInterval * 24 * 60 * 60 * 1000
  ).toISOString();

  return { easeFactor: newEaseFactor, interval: newInterval, nextReviewAt };
}

export const flashcardsHandlers = [
  // GET /api/materials/:materialId/flashcards - List flashcards for a material
  http.get("/api/materials/:materialId/flashcards", async ({ params }) => {
    await delay(250);

    const { materialId } = params;
    const materialFlashcards = flashcards.filter(
      (f) => f.materialId === materialId
    );

    return HttpResponse.json({
      data: materialFlashcards,
      total: materialFlashcards.length,
    });
  }),

  // GET /api/flashcards/:id - Get single flashcard
  http.get("/api/flashcards/:id", async ({ params }) => {
    await delay(200);

    const { id } = params;
    const flashcard = flashcards.find((f) => f.id === id);

    if (!flashcard) {
      return HttpResponse.json(
        { error: "Kartička nenalezena", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: flashcard });
  }),

  // POST /api/materials/:materialId/flashcards - Create flashcard
  http.post(
    "/api/materials/:materialId/flashcards",
    async ({ params, request }) => {
      await delay(400);

      const { materialId } = params;
      const body = (await request.json()) as Record<string, unknown>;

      if (!body.question || typeof body.question !== "string") {
        return HttpResponse.json(
          { error: "Otázka je povinná", code: "VALIDATION_ERROR" },
          { status: 400 }
        );
      }

      if (!body.answer || typeof body.answer !== "string") {
        return HttpResponse.json(
          { error: "Odpověď je povinná", code: "VALIDATION_ERROR" },
          { status: 400 }
        );
      }

      const newFlashcard = createMockFlashcard({
        materialId: materialId as string,
        question: body.question,
        answer: body.answer,
        difficulty: (body.difficulty as "easy" | "medium" | "hard") || "medium",
        tags: (body.tags as string[]) || [],
      });

      flashcards.push(newFlashcard);

      return HttpResponse.json(
        { data: newFlashcard, message: "Kartička byla úspěšně vytvořena" },
        { status: 201 }
      );
    }
  ),

  // POST /api/flashcards/:id/review - Review flashcard (spaced repetition)
  http.post("/api/flashcards/:id/review", async ({ params, request }) => {
    await delay(200);

    const { id } = params;
    const body = (await request.json()) as Record<string, unknown>;
    const flashcardIndex = flashcards.findIndex((f) => f.id === id);

    if (flashcardIndex === -1) {
      return HttpResponse.json(
        { error: "Kartička nenalezena", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const quality = body.quality as number;
    if (typeof quality !== "number" || quality < 0 || quality > 5) {
      return HttpResponse.json(
        { error: "Kvalita musí být mezi 0 a 5", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const flashcard = flashcards[flashcardIndex];
    const nextReview = calculateNextReview(
      quality,
      flashcard.easeFactor,
      flashcard.interval
    );

    const updatedFlashcard: Flashcard = {
      ...flashcard,
      ...nextReview,
      reviewCount: flashcard.reviewCount + 1,
      updatedAt: new Date().toISOString(),
    };

    flashcards[flashcardIndex] = updatedFlashcard;

    return HttpResponse.json({
      data: updatedFlashcard,
      message: "Recenze byla úspěšně zaznamenána",
    });
  }),

  // PATCH /api/flashcards/:id - Update flashcard
  http.patch("/api/flashcards/:id", async ({ params, request }) => {
    await delay(300);

    const { id } = params;
    const body = (await request.json()) as Record<string, unknown>;
    const flashcardIndex = flashcards.findIndex((f) => f.id === id);

    if (flashcardIndex === -1) {
      return HttpResponse.json(
        { error: "Kartička nenalezena", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const updatedFlashcard: Flashcard = {
      ...flashcards[flashcardIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    flashcards[flashcardIndex] = updatedFlashcard;

    return HttpResponse.json({
      data: updatedFlashcard,
      message: "Kartička byla úspěšně aktualizována",
    });
  }),

  // DELETE /api/flashcards/:id - Delete flashcard
  http.delete("/api/flashcards/:id", async ({ params }) => {
    await delay(300);

    const { id } = params;
    const flashcardIndex = flashcards.findIndex((f) => f.id === id);

    if (flashcardIndex === -1) {
      return HttpResponse.json(
        { error: "Kartička nenalezena", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    flashcards.splice(flashcardIndex, 1);

    return HttpResponse.json({
      message: "Kartička byla úspěšně smazána",
    });
  }),

  // GET /api/flashcards/due - Get due flashcards for review
  http.get("/api/flashcards/due", async () => {
    await delay(300);

    const now = new Date().toISOString();
    const dueFlashcards = flashcards.filter(
      (f) => !f.nextReviewAt || f.nextReviewAt <= now
    );

    return HttpResponse.json({
      data: dueFlashcards,
      total: dueFlashcards.length,
    });
  }),
];
