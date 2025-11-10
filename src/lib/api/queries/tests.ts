import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api/client";
import {
  Test,
  TestListItem,
  TestResultsResponse,
  TestStatus,
} from "@/lib/validations/test";

// API Response types
interface TestsResponse {
  data: TestListItem[];
}

interface TestResponse {
  data: Test;
}

interface TestStatusResponse {
  data: {
    testId: string;
    status: TestStatus;
    generationError: string | null;
  };
}

interface TestResultsResponseWrapper {
  data: TestResultsResponse;
}

/**
 * Query: Get all tests for a source
 */
export function useTests(sourceId: number | null) {
  return useQuery({
    queryKey: ["tests", sourceId],
    queryFn: async () => {
      const response = await get<TestsResponse>(`/sources/${sourceId}/tests`);
      // Sort by createdAt (newest first)
      const sortedData = response.data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return {
        ...response,
        data: sortedData,
      };
    },
    enabled: !!sourceId,
  });
}

/**
 * Query: Get single test by ID
 */
export function useTest(testId: string | null) {
  return useQuery({
    queryKey: ["tests", "detail", testId],
    queryFn: () => get<TestResponse>(`/tests/${testId}`),
    enabled: !!testId,
  });
}

/**
 * Query: Get test generation status (for polling during generation)
 */
export function useTestStatus(testId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ["tests", "status", testId],
    queryFn: () => get<TestStatusResponse>(`/tests/${testId}/status`),
    enabled: !!testId && enabled,
    refetchInterval: (query) => {
      // Poll every 1 second while generating
      if (query.state.data?.data?.status === "generating") {
        return 1000;
      }
      return false; // Stop polling when ready or failed
    },
  });
}

/**
 * Query: Get test results for a completed instance
 */
export function useTestResults(instanceId: string | null) {
  return useQuery({
    queryKey: ["tests", "results", instanceId],
    queryFn: () =>
      get<TestResultsResponseWrapper>(`/instances/${instanceId}/results`),
    enabled: !!instanceId,
  });
}
