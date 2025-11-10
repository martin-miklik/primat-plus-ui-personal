import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api/client";
import { Flashcard } from "@/lib/validations/flashcard";

// API Response types
interface FlashcardsApiResponse {
  data: {
    sourceId: number;
    count: number;
    flashcards: Flashcard[];
  };
}

// Normalized response for component consumption
interface FlashcardsData {
  data: Flashcard[];
  total: number;
}

/**
 * Query: Get all flashcards for a source
 */
export function useFlashcards(sourceId: number) {
  return useQuery({
    queryKey: ["flashcards", sourceId],
    queryFn: async () => {
      const response = await get<FlashcardsApiResponse>(
        `/sources/${sourceId}/flashcards`
      );
      // Normalize response for easier consumption
      return {
        data: response.data.flashcards,
        total: response.data.count,
      } as FlashcardsData;
    },
    enabled: !!sourceId,
  });
}

/**
 * Query: Get flashcards due for review
 */
export function useFlashcardsForRepeat(sourceId: number) {
  return useQuery({
    queryKey: ["flashcards", sourceId, "repeat"],
    queryFn: async () => {
      const response = await get<FlashcardsApiResponse>(
        `/sources/${sourceId}/flashcards/repeat`
      );
      // Normalize response for easier consumption
      return {
        data: response.data.flashcards,
        total: response.data.count,
      } as FlashcardsData;
    },
    enabled: !!sourceId,
  });
}

