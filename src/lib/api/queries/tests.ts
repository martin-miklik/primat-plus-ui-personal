import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api/client";
import {
  TestResultsResponse,
  TestListItem,
  Test,
} from "@/lib/validations/test";

// Response wrappers
interface TestsListWrapper {
  data: TestListItem[];
}

interface TestWrapper {
  data: Test;
}

interface TestResultsResponseWrapper {
  data: TestResultsResponse;
}

/**
 * Query: Get all tests for a specific source
 */
export function useTests(sourceId: number) {
  return useQuery({
    queryKey: ["tests", sourceId],
    queryFn: () => get<TestsListWrapper>(`/sources/${sourceId}/tests`),
    enabled: !!sourceId,
  });
}

/**
 * Query: Get a single test by ID
 */
export function useTest(testId: string | null) {
  return useQuery({
    queryKey: ["tests", "detail", testId],
    queryFn: () => get<TestWrapper>(`/tests/${testId}`),
    enabled: !!testId,
  });
}

/**
 * Query: Get test generation status
 * 
 * NOTE: This hook is DEPRECATED - Use Centrifugo WebSocket instead!
 * Backend publishes real-time updates via WebSocket according to
 * docs/websocket-states-spec.md
 * 
 * Events:
 * - job_started → "Připravujeme test..."
 * - generating → "AI píše otázky..."
 * - complete → "Test je připraven!" (includes testId)
 * - error → Show error message
 * 
 * Use the `channel` field from test generation response to subscribe.
 */
// export function useTestStatus(testId: string | null, enabled: boolean = true) {
//   return useQuery({
//     queryKey: ["tests", "status", testId],
//     queryFn: () => get<TestStatusWrapper>(`/tests/${testId}/status`),
//     enabled: !!testId && enabled,
//     refetchInterval: (query) => {
//       // Poll every 1 second while generating
//       if (query.state.data?.data?.status === "generating") {
//         return 1000;
//       }
//       return false; // Stop polling when ready or failed
//     },
//   });
// }

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

