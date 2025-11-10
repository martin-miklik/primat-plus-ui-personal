import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api/client";
import { TestInstanceStartResponse } from "@/lib/validations/test";

// API Response type
interface TestInstanceResponse {
  data: TestInstanceStartResponse;
}

/**
 * Query: Get test instance details (for resuming/loading a test)
 */
export function useTestInstance(instanceId: string | null) {
  return useQuery({
    queryKey: ["instances", instanceId],
    queryFn: () => get<TestInstanceResponse>(`/instances/${instanceId}`),
    enabled: !!instanceId,
  });
}



