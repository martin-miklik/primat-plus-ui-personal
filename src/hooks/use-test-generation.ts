import { useEffect, useState } from "react";
import { useTestStatus } from "@/lib/api/queries/tests";
import { TestStatus } from "@/lib/validations/test";

/**
 * Hook for managing test generation progress
 * Polls the test status endpoint until generation completes
 */
export function useTestGeneration(testId: string | null, enabled: boolean = true) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<TestStatus>("generating");

  // Poll test status
  const { data: statusData, isLoading } = useTestStatus(testId, enabled);

  useEffect(() => {
    if (!statusData?.data) return;

    const currentStatus = statusData.data.status;
    setStatus(currentStatus);

    // Update progress based on status
    if (currentStatus === "generating") {
      // Simulate progress from 0 to 90% while generating
      // Real implementation would get progress from websocket
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return 90;
          return prev + Math.random() * 10;
        });
      }, 500);

      return () => clearInterval(interval);
    } else if (currentStatus === "ready") {
      setProgress(100);
    } else if (currentStatus === "failed") {
      setProgress(0);
    }
  }, [statusData]);

  return {
    status,
    progress: Math.min(Math.round(progress), 100),
    isGenerating: status === "generating",
    isReady: status === "ready",
    isFailed: status === "failed",
    error: statusData?.data?.generationError,
    isLoading,
  };
}







