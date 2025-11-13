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
    success: boolean;
    message: string;
    channel: string;
    jobId: string;
    process: "flashcards";
    status: "queued";
    sourceId: number;
    count: number;
  };
}

interface UpdateNextRepetitionApiResponse {
  data: Flashcard;
}

/**
 * Mutation: Generate flashcards
 * Returns job info for WebSocket subscription (doesn't wait for completion)
 */
export function useGenerateFlashcards(sourceId: number) {
  return useMutation({
    mutationFn: (input: GenerateFlashcardsInput) =>
      post<GenerateFlashcardsApiResponse>(
        `/sources/${sourceId}/generate-flashcards`,
        input
      ),

    onSuccess: (response) => {
      // Don't invalidate queries here - wait for WebSocket complete event
      // The parent component will handle invalidation when the job completes
      console.log(
        "[Flashcards] Generation queued:",
        response.data.jobId,
        response.data.channel
      );
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
