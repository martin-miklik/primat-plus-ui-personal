import { useMutation, useQueryClient } from "@tanstack/react-query";
import { post } from "@/lib/api/client";
import {
  TestConfiguration,
  TestGenerationResponse,
  TestInstanceStartResponse,
  AnswerFeedbackResponse,
  TestCompletionResponse,
  SubmitAnswer,
} from "@/lib/validations/test";
import { toast } from "sonner";

// API Response wrappers
interface TestGenerationResponseWrapper {
  data: TestGenerationResponse;
}

interface TestInstanceStartResponseWrapper {
  data: TestInstanceStartResponse;
}

interface AnswerFeedbackResponseWrapper {
  data: AnswerFeedbackResponse;
}

interface TestCompletionResponseWrapper {
  data: TestCompletionResponse;
}

/**
 * Mutation: Generate new test
 */
export function useGenerateTest(sourceId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: TestConfiguration) =>
      post<TestGenerationResponseWrapper>(`/sources/${sourceId}/tests`, config),

    onSuccess: () => {
      // Invalidate tests list to show new test
      queryClient.invalidateQueries({ queryKey: ["tests", sourceId] });
      toast.success("Test se začal generovat");
    },

    onError: (error: Error) => {
      toast.error(error.message || "Nepodařilo se vytvořit test");
    },
  });
}

/**
 * Mutation: Start test (create instance)
 */
export function useStartTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (testId: string) =>
      post<TestInstanceStartResponseWrapper>(`/tests/${testId}/instances`, {}),

    onSuccess: (response, testId) => {
      // Invalidate test detail to update instance count
      queryClient.invalidateQueries({ queryKey: ["tests", "detail", testId] });
      toast.success("Test byl zahájen");
    },

    onError: (error: Error) => {
      toast.error(error.message || "Nepodařilo se zahájit test");
    },
  });
}

/**
 * Mutation: Submit answer to a question
 */
export function useSubmitAnswer(instanceId: string) {
  return useMutation({
    mutationFn: (answer: SubmitAnswer) =>
      post<AnswerFeedbackResponseWrapper>(
        `/instances/${instanceId}/answers`,
        answer
      ),

    onSuccess: () => {
      // Note: Don't show toast for each answer, too noisy
      // The UI will show feedback directly based on response
    },

    onError: (error: Error) => {
      toast.error(error.message || "Nepodařilo se odeslat odpověď");
    },
  });
}

/**
 * Mutation: Complete test
 */
export function useCompleteTest(instanceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      post<TestCompletionResponseWrapper>(
        `/instances/${instanceId}/complete`,
        {}
      ),

    onSuccess: () => {
      // Invalidate results query so it can be fetched
      queryClient.invalidateQueries({
        queryKey: ["tests", "results", instanceId],
      });
      toast.success("Test byl dokončen");
    },

    onError: (error: Error) => {
      toast.error(error.message || "Nepodařilo se dokončit test");
    },
  });
}
