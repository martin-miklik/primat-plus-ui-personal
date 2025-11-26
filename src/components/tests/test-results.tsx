"use client";

import { useTranslations } from "next-intl";
import { 
  CheckCircle2, 
  XCircle, 
  Award, 
  Clock,
  AlertCircle 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { TestResultsResponse, QuestionResult } from "@/lib/validations/test";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { cs } from "date-fns/locale";

interface TestResultsProps {
  results: TestResultsResponse;
}

export function TestResults({ results }: TestResultsProps) {
  const t = useTranslations("tests");

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 75) return "text-blue-600";
    if (percentage >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getGradeLabel = (percentage: number) => {
    if (percentage >= 90) return t("results.gradeExcellent");
    if (percentage >= 75) return t("results.gradeGood");
    if (percentage >= 60) return t("results.gradeFair");
    return t("results.gradeNeedsWork");
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Score Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <Award className={cn("h-10 w-10", getGradeColor(results.percentage))} />
            </div>
            <h2 className="text-3xl font-bold">
              {results.score}/{results.totalQuestions}
            </h2>
            <p className={cn("text-2xl font-semibold", getGradeColor(results.percentage))}>
              {results.percentage.toFixed(1)}%
            </p>
            <p className="text-lg text-muted-foreground">
              {getGradeLabel(results.percentage)}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={results.percentage} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{t("results.correct", { count: results.score })}</span>
              <span>
                {t("results.incorrect", {
                  count: results.totalQuestions - results.score,
                })}
              </span>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                {format(new Date(results.completedAt), "d. MMM yyyy HH:mm", {
                  locale: cs,
                })}
              </span>
            </div>
          </div>

          {/* Evaluating Notice */}
          {results.evaluatingCount > 0 && (
            <div className="rounded-lg border border-blue-500 bg-blue-50 dark:bg-blue-950/20 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {t("results.evaluating")}
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                    {t("results.evaluatingDesc", {
                      count: results.evaluatingCount,
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Question-by-Question Results */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">{t("results.detailedResults")}</h3>

        {results.results.map((result) => (
          <QuestionResultCard key={result.questionIndex} result={result} />
        ))}
      </div>
    </div>
  );
}

interface QuestionResultCardProps {
  result: QuestionResult;
}

function QuestionResultCard({ result }: QuestionResultCardProps) {
  const t = useTranslations("tests");

  const formatAnswer = (
    answer: string | string[] | boolean | null | undefined
  ): string => {
    if (answer === null || answer === undefined) return t("results.noAnswer");
    if (typeof answer === "boolean") return answer ? t("question.true") : t("question.false");
    if (Array.isArray(answer)) return answer.join(", ");
    return String(answer);
  };

  const getOptionText = (optionId: string): string => {
    const option = result.options?.find((opt) => opt.id === optionId);
    return option ? option.text : optionId;
  };

  const formatAnswerWithLabels = (
    answer: string | string[] | boolean | null | undefined
  ): string => {
    if (answer === null || answer === undefined) return t("results.noAnswer");
    if (typeof answer === "boolean") return answer ? t("question.true") : t("question.false");
    if (Array.isArray(answer)) {
      return answer.map((a) => getOptionText(a)).join(", ");
    }
    
    // Handle comma-separated string (e.g., "a,c,d")
    const answerStr = String(answer);
    if (answerStr.includes(",")) {
      return answerStr
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
        .map((id) => getOptionText(id))
        .join(", ");
    }
    
    return getOptionText(answerStr);
  };

  return (
    <Card
      className={cn(
        "p-6 border-l-4",
        result.isCorrect
          ? "border-l-green-500"
          : "border-l-red-500"
      )}
    >
      <div className="space-y-4">
        {/* Question Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {t("results.question")} {result.questionIndex + 1}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {t(`questionType.${result.type}`)}
              </Badge>
            </div>
            <h4 className="font-semibold">{result.question}</h4>
          </div>
          <div className="flex-shrink-0">
            {result.isCorrect ? (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
          </div>
        </div>

        <Separator />

        {/* Answers */}
        <div className="space-y-3">
          {/* Student Answer */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {t("results.yourAnswer")}:
            </p>
            <p className={cn(
              "text-sm",
              !result.isCorrect && "text-red-600"
            )}>
              {result.type === "open_ended"
                ? formatAnswer(result.studentAnswer)
                : formatAnswerWithLabels(result.studentAnswer)}
            </p>
          </div>

          {/* Correct Answer (if wrong) */}
          {!result.isCorrect && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {t("results.correctAnswer")}:
              </p>
              <p className="text-sm text-green-600">
                {result.type === "open_ended"
                  ? formatAnswer(result.correctAnswer)
                  : formatAnswerWithLabels(result.correctAnswer)}
              </p>
            </div>
          )}
        </div>

        {/* Explanation */}
        {result.explanation && (
          <>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {t("results.explanation")}:
              </p>
              <p className="text-sm">{result.explanation}</p>
            </div>
          </>
        )}

        {/* AI Feedback (for open-ended) */}
        {result.aiFeedback && (
          <>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {t("results.aiFeedback")}:
              </p>
              <p className="text-sm">{result.aiFeedback}</p>
              {result.score != null && (
                <p className="text-sm mt-2 text-muted-foreground">
                  {t("results.score")}: {Math.round(result.score * 100)}%
                </p>
              )}
            </div>
          </>
        )}

        {/* Still Evaluating (for open-ended without feedback yet) */}
        {result.type === "open_ended" && !result.aiFeedback && result.score === null && (
          <div className="rounded-lg border border-blue-500 bg-blue-50 dark:bg-blue-950/20 p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {t("results.stillEvaluating")}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

