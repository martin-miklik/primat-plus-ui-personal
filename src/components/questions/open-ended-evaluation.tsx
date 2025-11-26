"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useJobSubscription } from "@/hooks/use-job-subscription";
import type { TestAnswerEvaluatedEvent } from "@/types/websocket-events";
import { AnswerFeedbackResponse } from "@/lib/validations/test";

interface OpenEndedEvaluationProps {
  /** WebSocket channel to subscribe to */
  channel: string;
  /** Job ID for tracking */
  jobId: string;
  /** Question index being evaluated */
  questionIndex: number;
  /** Called when evaluation completes successfully */
  onComplete: (feedback: AnswerFeedbackResponse) => void;
  /** Called when evaluation fails */
  onError?: (error: string) => void;
}

export function OpenEndedEvaluation({
  channel,
  jobId: _jobId,
  questionIndex,
  onComplete,
  onError,
}: OpenEndedEvaluationProps) {
  const t = useTranslations("tests");
  const [evaluationResult, setEvaluationResult] = useState<TestAnswerEvaluatedEvent | null>(null);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  // Subscribe to WebSocket for real-time evaluation updates
  const { status, error } = useJobSubscription({
    channel,
    process: "test",
    enabled: true,
    onEvent: (event) => {
      console.log("[OpenEndedEvaluation] Received event:", event);
      
      // Check if this is the answer_evaluated event
      if (event.type === "answer_evaluated") {
        // Backend sends answer_evaluated with userAnswerId and questionIndex
        const data = event as TestAnswerEvaluatedEvent;
        
        // Verify this is for our question
        if (data.questionIndex === questionIndex) {
          // Parse score - backend sends as string
          const scoreValue = typeof data.score === 'string' 
            ? parseFloat(data.score) 
            : data.score;
          
          setEvaluationResult({
            ...data,
            score: scoreValue,
            feedback: data.feedback,
          } as TestAnswerEvaluatedEvent);
        }
      }
    },
    onComplete: (event) => {
      console.log("[OpenEndedEvaluation] Evaluation complete:", event);
      
      // If we have the evaluation result, call onComplete
      if (evaluationResult) {
        onComplete({
          success: true,
          isCorrect: evaluationResult.isCorrect,
          score: evaluationResult.score,
          aiFeedback: evaluationResult.feedback,
        });
      }
    },
    onError: (event, errorMessage) => {
      console.error("[OpenEndedEvaluation] Error:", errorMessage);
      onError?.(errorMessage);
    },
  });

  // Timeout after 30 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (status !== "complete" && status !== "error") {
        setHasTimedOut(true);
        onError?.(t("evaluation.timeout"));
      }
    }, 30000);

    return () => clearTimeout(timeout);
  }, [status, onError, t]);

  // If we got the result, trigger completion
  useEffect(() => {
    if (evaluationResult && status === "complete") {
      onComplete({
        success: true,
        isCorrect: evaluationResult.isCorrect,
        score: evaluationResult.score,
        aiFeedback: evaluationResult.feedback,
      });
    }
  }, [evaluationResult, status, onComplete]);

  if (hasTimedOut) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          {t("evaluation.timeoutMessage")}
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "complete" && evaluationResult) {
    const isCorrect = evaluationResult.isCorrect;
    const borderColor = isCorrect ? "border-l-green-500" : "border-l-red-500";
    const bgColor = isCorrect ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20";
    const iconColor = isCorrect ? "text-green-600" : "text-red-600";
    const textColor = isCorrect ? "text-green-900 dark:text-green-100" : "text-red-900 dark:text-red-100";
    const Icon = isCorrect ? CheckCircle2 : XCircle;
    
    return (
      <Card className={`p-6 border-l-4 ${borderColor} ${bgColor}`}>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Icon className={`h-6 w-6 ${iconColor} flex-shrink-0 mt-0.5`} />
            <div className="flex-1">
              <h4 className={`font-semibold ${textColor} mb-2`}>
                {isCorrect ? t("feedback.correct") : t("feedback.incorrect")}
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                {t("evaluation.score")}: {Math.round(evaluationResult.score * 100)}%
              </p>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-sm whitespace-pre-wrap">{evaluationResult.feedback}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Loading state
  return (
    <Card className="p-6 border-l-4 border-l-blue-500">
      <div className="flex items-start gap-3">
        <Loader2 className="h-6 w-6 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            {t("evaluation.evaluating")}
          </h4>
          <p className="text-sm text-muted-foreground">
            {status === "started" 
              ? t("evaluation.starting")
              : status === "processing"
              ? t("evaluation.analyzing")
              : t("evaluation.pleaseWait")}
          </p>
        </div>
      </div>
    </Card>
  );
}

