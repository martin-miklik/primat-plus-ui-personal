import { http, HttpResponse, delay } from "msw";
import { mockFlashcards } from "@/mocks/fixtures/flashcards";
import { Flashcard } from "@/lib/validations/flashcard";
import { apiPath } from "@/mocks/config";

// In-memory store for flashcards (mutable for MSW)
// eslint-disable-next-line prefer-const
let flashcards = [...mockFlashcards];

export const flashcardsHandlers = [
  // GET /api/v1/sources/:sourceId/flashcards - Get all flashcards for a source
  http.get(apiPath("/sources/:sourceId/flashcards"), async ({ params }) => {
    await delay(250);

    const { sourceId } = params;
    const sourceFlashcards = flashcards.filter(
      (f) => f.sourceId === Number(sourceId)
    );

    return HttpResponse.json({
      data: {
        sourceId: Number(sourceId),
        count: sourceFlashcards.length,
        flashcards: sourceFlashcards,
      },
    });
  }),

  // POST /api/v1/sources/:sourceId/generate-flashcards - Generate flashcards
  http.post(
    apiPath("/sources/:sourceId/generate-flashcards"),
    async ({ params, request }) => {
      await delay(2000); // Simulate AI generation time

      const { sourceId } = params;
      const body = (await request.json()) as Record<string, unknown>;

      if (!body.count || typeof body.count !== "number") {
        return HttpResponse.json(
          { error: "Počet kartiček je povinný", code: "VALIDATION_ERROR" },
          { status: 400 }
        );
      }

      const count = body.count as number;
      if (count < 1 || count > 30) {
        return HttpResponse.json(
          {
            error: "Počet kartiček musí být mezi 1 a 30",
            code: "VALIDATION_ERROR",
          },
          { status: 400 }
        );
      }

      // Generate mock flashcards
      const newFlashcards: Flashcard[] = [];
      for (let i = 0; i < count; i++) {
        const newCard: Flashcard = {
          id: `generated-${Date.now()}-${i}`,
          sourceId: Number(sourceId),
          frontSide: `Vygenerovaná otázka ${i + 1}`,
          backSide: `Vygenerovaná odpověď pro otázku ${i + 1}`,
          nextRepetitionDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: null,
        };
        newFlashcards.push(newCard);
        flashcards.push(newCard);
      }

      return HttpResponse.json({
        data: {
          sourceId: Number(sourceId),
          count: newFlashcards.length,
          flashcards: newFlashcards,
        },
      });
    }
  ),

  // GET /api/v1/sources/:sourceId/flashcards/repeat - Get flashcards due for review
  http.get(
    apiPath("/sources/:sourceId/flashcards/repeat"),
    async ({ params }) => {
      await delay(250);

      const { sourceId } = params;
      const now = new Date().toISOString();
      const dueFlashcards = flashcards.filter(
        (f) => f.sourceId === Number(sourceId) && f.nextRepetitionDate <= now
      );

      return HttpResponse.json({
        data: {
          sourceId: Number(sourceId),
          count: dueFlashcards.length,
          flashcards: dueFlashcards,
        },
      });
    }
  ),

  // PUT /api/v1/sources/:sourceId/flashcards/:flashcardId/next-repetition - Update next repetition
  http.put(
    apiPath("/sources/:sourceId/flashcards/:flashcardId/next-repetition"),
    async ({ params, request }) => {
      await delay(200);

      const { sourceId, flashcardId } = params;
      const body = (await request.json()) as Record<string, unknown>;

      if (!body.minutesOffset || typeof body.minutesOffset !== "number") {
        return HttpResponse.json(
          {
            error: "Počet minut je povinný",
            code: "VALIDATION_ERROR",
          },
          { status: 400 }
        );
      }

      const flashcardIndex = flashcards.findIndex(
        (f) => f.id === flashcardId && f.sourceId === Number(sourceId)
      );

      if (flashcardIndex === -1) {
        return HttpResponse.json(
          { error: "Kartička nenalezena", code: "NOT_FOUND" },
          { status: 404 }
        );
      }

      const flashcard = flashcards[flashcardIndex];
      const minutesOffset = body.minutesOffset as number;
      const currentDate = new Date(flashcard.nextRepetitionDate);
      const newDate = new Date(
        currentDate.getTime() + minutesOffset * 60 * 1000
      );

      const updatedFlashcard: Flashcard = {
        ...flashcard,
        nextRepetitionDate: newDate.toISOString(),
        updatedAt: new Date().toISOString(),
      };

      flashcards[flashcardIndex] = updatedFlashcard;

      return HttpResponse.json({
        data: updatedFlashcard,
        message: "Datum dalšího opakování bylo aktualizováno",
      });
    }
  ),
];
