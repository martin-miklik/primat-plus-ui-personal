"use client";

import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import {
  FileBarChart,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TestListItem } from "@/lib/validations/test";
import { Typography } from "@/components/ui/Typography";

interface TestCardProps {
  test: TestListItem;
  onStartTest?: (testId: string) => void;
}

export function TestCard({ test, onStartTest }: TestCardProps) {
  const t = useTranslations("tests");

  const getStatusConfig = () => {
    switch (test.status) {
      case "ready":
        return {
          icon: CheckCircle2,
          label: t("status.ready"),
          className:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        };
      case "generating":
        return {
          icon: Loader2,
          label: t("status.generating"),
          className:
            "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        };
      case "failed":
        return {
          icon: AlertCircle,
          label: t("status.failed"),
          className:
            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const difficultyLabels = test.difficulty
    .map((d) => t(`difficulty.${d}`))
    .join(", ");

  const isReady = test.status === "ready";

  return (
    <Card className="group relative p-4 hover:shadow-md transition-all">
      {/* Status Badge */}
      <Badge
        variant="secondary"
        className={cn("absolute top-2 right-2 gap-1", statusConfig.className)}
      >
        <StatusIcon
          className={cn(
            "h-3 w-3",
            test.status === "generating" && "animate-spin"
          )}
        />
        <span className="text-xs">{statusConfig.label}</span>
      </Badge>

      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start gap-3 pr-20">
          <div className="flex-shrink-0 rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3">
            <FileBarChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <Typography variant="h4" className="mb-1">
              {t("card.title", { count: test.questionCount })}
            </Typography>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{difficultyLabels}</span>
              <span>•</span>
              <span>
                {test.reviewMode === "during"
                  ? t("reviewMode.during")
                  : t("reviewMode.after")}
              </span>
              <span>•</span>
              <span>
                {format(new Date(test.createdAt), "d. MMM yyyy", {
                  locale: cs,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Question Types */}
        <div className="flex flex-wrap gap-1">
          {test.questionTypes.map((type) => (
            <Badge key={type} variant="outline" className="text-xs">
              {t(`questionType.${type}`)}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {test.instanceCount === 0
                ? t("card.noAttempts")
                : t("card.attempts", { count: test.instanceCount })}
            </span>
          </div>

          <Button
            size="sm"
            disabled={!isReady}
            onClick={() => onStartTest?.(test.id)}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            {t("card.start")}
          </Button>
        </div>
      </div>
    </Card>
  );
}
