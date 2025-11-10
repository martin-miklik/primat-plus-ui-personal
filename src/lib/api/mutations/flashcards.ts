import { useMutation, useQueryClient } from "@tanstack/react-query";
import { post, put } from "@/lib/api/client";
import {
  GenerateFlashcardsInput,
  UpdateNextRepetitionInput,
  Flashcard,
} from "@/lib/validations/flashcard";
import { toast } from "sonner";

// API Response types
interface GenerateFlashcardsApiResponse {
  data: {
    sourceId: number;
    count: number;
    flashcards: Flashcard[];
  };
}

interface UpdateNextRepetitionApiResponse {
  data: Flashcard;
}

/**
 * Mutation: Generate flashcards
 */
export function useGenerateFlashcards(sourceId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: GenerateFlashcardsInput) =>
      post<GenerateFlashcardsApiResponse>(
        `/sources/${sourceId}/generate-flashcards`,
        input
      ),

    onSuccess: () => {
      // Invalidate flashcards list to show new cards
      queryClient.invalidateQueries({ queryKey: ["flashcards", sourceId] });
      queryClient.invalidateQueries({
        queryKey: ["flashcards", sourceId, "repeat"],
      });
      toast.success("Kartičky byly úspěšně vygenerovány");
    },

    onError: (error: Error) => {
      toast.error(error.message || "Nepodařilo se vygenerovat kartičky");
    },
  });
}

/**
 * Mutation: Update next repetition date
 */
export function useUpdateNextRepetition(sourceId: number, flashcardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateNextRepetitionInput) =>
      put<UpdateNextRepetitionApiResponse>(
        `/sources/${sourceId}/flashcards/${flashcardId}/next-repetition`,
        input
      ),

    onSuccess: () => {
      // Invalidate flashcards queries to update due dates
      queryClient.invalidateQueries({ queryKey: ["flashcards", sourceId] });
      queryClient.invalidateQueries({
        queryKey: ["flashcards", sourceId, "repeat"],
      });
    },

    onError: (error: Error) => {
      toast.error(
        error.message || "Nepodařilo se aktualizovat datum opakování"
      );
    },
  });
}
