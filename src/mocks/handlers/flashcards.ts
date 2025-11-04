import { http, HttpResponse, delay } from "msw";
import {
  mockFlashcards,
  createMockFlashcard,
} from "@/mocks/fixtures/flashcards";
import { Flashcard } from "@/lib/validations/flashcard";
import { apiPath } from "@/mocks/config";

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
  // GET /api/v1/sources/:sourceId/flashcards - List flashcards for a source
  http.get(apiPath("/sources/:sourceId/flashcards"), async ({ params }) => {
    await delay(250);

    const { sourceId } = params;
    const sourceFlashcards = flashcards.filter(
      (f) => f.sourceId === Number(sourceId)
    );

    return HttpResponse.json({
      data: sourceFlashcards,
      total: sourceFlashcards.length,
    });
  }),

  // GET /api/v1/flashcards/:id - Get single flashcard
  http.get(apiPath("/flashcards/:id"), async ({ params }) => {
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

  // POST /api/v1/sources/:sourceId/flashcards - Create flashcard
  http.post(
    apiPath("/sources/:sourceId/flashcards"),
    async ({ params, request }) => {
      await delay(400);

      const { sourceId } = params;
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
        sourceId: Number(sourceId),
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

  // POST /api/v1/flashcards/:id/review - Review flashcard (spaced repetition)
  http.post(apiPath("/flashcards/:id/review"), async ({ params, request }) => {
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

  // PATCH /api/v1/flashcards/:id - Update flashcard
  http.patch(apiPath("/flashcards/:id"), async ({ params, request }) => {
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

  // DELETE /api/v1/flashcards/:id - Delete flashcard
  http.delete(apiPath("/flashcards/:id"), async ({ params }) => {
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

  // GET /api/v1/flashcards/due - Get due flashcards for review
  http.get(apiPath("/flashcards/due"), async () => {
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
