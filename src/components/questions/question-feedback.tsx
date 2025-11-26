"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { AnswerFeedbackResponse, Option } from "@/lib/validations/test";
import { cn } from "@/lib/utils";

interface QuestionFeedbackProps {
  feedback: AnswerFeedbackResponse;
  options?: Option[];
  questionType?: string;
  className?: string;
}

export function QuestionFeedback({ feedback, options, questionType: _questionType, className }: QuestionFeedbackProps) {
  const t = useTranslations("tests");

  // Helper to get array of answer texts
  const getAnswerTexts = (answer: string | string[] | boolean | undefined): string[] => {
    if (answer === undefined || answer === null) return [t("results.noAnswer")];
    
    // Handle boolean (true/false questions)
    if (typeof answer === "boolean") {
      return [answer ? t("question.true") : t("question.false")];
    }
    
    // Handle true/false as strings
    if (answer === "true") return [t("question.true")];
    if (answer === "false") return [t("question.false")];
    
    // If no options provided, return as-is
    if (!options || options.length === 0) {
      if (Array.isArray(answer)) return answer;
      return [String(answer)];
    }
    
    // Map option IDs to text
    const getOptionText = (id: string) => {
      const option = options.find(opt => opt.id === id);
      return option ? option.text : id;
    };
    
    if (Array.isArray(answer)) {
      return answer.map(a => getOptionText(a));
    }
    
    // Handle comma-separated string
    const answerStr = String(answer);
    if (answerStr.includes(",")) {
      return answerStr
        .split(",")
        .map(id => id.trim())
        .filter(Boolean)
        .map(id => getOptionText(id));
    }
    
    return [getOptionText(answerStr)];
  };

  // For open-ended questions being evaluated
  if (feedback.jobId) {
    return (
      <Alert className={cn("border-blue-500 bg-blue-50 dark:bg-blue-950/20", className)}>
        <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
        <AlertTitle className="text-blue-900 dark:text-blue-100">
          {t("feedback.evaluating")}
        </AlertTitle>
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          {feedback.message || t("feedback.evaluatingDesc")}
        </AlertDescription>
      </Alert>
    );
  }

  // For "after" review mode - just confirmation
  if (feedback.saved) {
    return (
      <Alert className={cn("border-green-500 bg-green-50 dark:bg-green-950/20", className)}>
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-900 dark:text-green-100">
          {t("feedback.saved")}
        </AlertTitle>
        <AlertDescription className="text-green-800 dark:text-green-200">
          {t("feedback.savedDesc")}
        </AlertDescription>
      </Alert>
    );
  }

  // For "during" review mode - show correctness
  const isCorrect = feedback.isCorrect ?? false;

  return (
    <Card
      className={cn(
        "p-4 border-2",
        isCorrect
          ? "border-green-500 bg-green-50 dark:bg-green-950/20"
          : "border-red-500 bg-red-50 dark:bg-red-950/20",
        className
      )}
    >
      <div className="space-y-3">
        {/* Result Header */}
        <div className="flex items-center gap-2">
          {isCorrect ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          )}
          <h4 className="font-semibold">
            {isCorrect ? t("feedback.correct") : t("feedback.incorrect")}
          </h4>
        </div>

        {/* Correct Answer (for incorrect responses) */}
        {!isCorrect && feedback.correctAnswer !== undefined && (
          <div className="pl-7">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {t("feedback.correctAnswer")}:
            </p>
            {(() => {
              const answers = getAnswerTexts(feedback.correctAnswer);
              if (answers.length === 1) {
                return <p className="text-sm text-green-600 dark:text-green-400">{answers[0]}</p>;
              }
              return (
                <ul className="list-disc list-inside text-sm text-green-600 dark:text-green-400 space-y-1">
                  {answers.map((answer, idx) => (
                    <li key={idx}>{answer}</li>
                  ))}
                </ul>
              );
            })()}
          </div>
        )}

        {/* Explanation */}
        {feedback.explanation && (
          <div className="pl-7">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {t("feedback.explanation")}:
            </p>
            <p className="text-sm">{feedback.explanation}</p>
          </div>
        )}

        {/* AI Feedback (for open-ended questions) */}
        {feedback.aiFeedback && (
          <div className="pl-7">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {t("feedback.aiFeedback")}:
            </p>
            <p className="text-sm">{feedback.aiFeedback}</p>
          </div>
        )}

        {/* Score (for open-ended questions) */}
        {feedback.score !== undefined && (
          <div className="pl-7">
            <p className="text-sm font-medium text-muted-foreground">
              {t("feedback.score")}: {Math.round(feedback.score * 100)}%
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

