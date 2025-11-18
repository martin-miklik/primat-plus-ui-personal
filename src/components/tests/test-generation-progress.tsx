"use client";

import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { useJobSubscription } from "@/hooks/use-job-subscription";

interface TestGenerationProgressProps {
  testId: string;
  channel: string | null;
  sourceId: number;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export function TestGenerationProgress({
  testId,
  channel,
  sourceId,
  onComplete,
  onError,
}: TestGenerationProgressProps) {
  const t = useTranslations("tests");
  const queryClient = useQueryClient();

  // WebSocket subscription for test generation progress
  const { status, progress, error } = useJobSubscription<"test">({
    channel: channel || undefined,
    process: "test",
    enabled: !!channel,
    onComplete: () => {
      // Refetch tests list when generation completes
      queryClient.invalidateQueries({
        queryKey: ["tests", sourceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["tests", "detail", testId],
      });
      toast.success(t("progress.ready"));
      onComplete?.();
    },
    onError: (event, errorMessage) => {
      toast.error(errorMessage);
      onError?.(errorMessage);
    },
  });

  const isReady = status === "complete";
  const isFailed = status === "error";

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          {isReady ? (
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          ) : isFailed ? (
            <AlertCircle className="h-8 w-8 text-red-600" />
          ) : (
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
          )}

          <div className="flex-1">
            <h3 className="font-semibold text-lg">
              {isReady
                ? t("progress.ready")
                : isFailed
                ? t("progress.failed")
                : t("progress.generating")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isReady
                ? t("progress.readyDesc")
                : isFailed
                ? error || t("progress.failedDesc")
                : t("progress.generatingDesc")}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {!isFailed && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-right text-muted-foreground">
              {progress}%
            </p>
          </div>
        )}

        {/* Status Messages */}
        {!isReady && !isFailed && (
          <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
            {progress < 30 && t("progress.stage1")}
            {progress >= 30 && progress < 60 && t("progress.stage2")}
            {progress >= 60 && progress < 90 && t("progress.stage3")}
            {progress >= 90 && t("progress.stage4")}
          </div>
        )}
      </div>
    </Card>
  );
}
