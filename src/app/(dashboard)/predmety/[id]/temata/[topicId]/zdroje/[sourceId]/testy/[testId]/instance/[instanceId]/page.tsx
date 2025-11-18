"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Typography } from "@/components/ui/Typography";
import { MultipleChoiceQuestion } from "@/components/questions/multiple-choice-question";
import { TrueFalseQuestion } from "@/components/questions/true-false-question";
import { OpenEndedQuestion } from "@/components/questions/open-ended-question";
import { QuestionFeedback } from "@/components/questions/question-feedback";
import { useTestSession } from "@/hooks/use-test-session";
import { useSubmitAnswer, useCompleteTest } from "@/lib/api/mutations/tests";
import { useTestInstance } from "@/lib/api/queries/test-instance";

interface TestTakingPageProps {
  params: Promise<{
    id: string;
    topicId: string;
    sourceId: string;
    testId: string;
    instanceId: string;
  }>;
}

export default function TestTakingPage({ params }: TestTakingPageProps) {
  const {
    id: subjectId,
    topicId,
    sourceId,
    testId,
    instanceId,
  } = use(params);
  const t = useTranslations("tests");
  const router = useRouter();

  // Load test instance data
  const { data: instanceData, isLoading, isError } = useTestInstance(instanceId);
  const submitAnswer = useSubmitAnswer(instanceId);
  const completeTest = useCompleteTest(instanceId);

  const testData = instanceData?.data
    ? {
        questions: instanceData.data.questions,
        reviewMode: instanceData.data.reviewMode,
      }
    : null;

  const session = useTestSession(testData?.questions || []);

  const handleAnswerSubmit = async (answer: string | string[] | boolean) => {
    try {
      const response = await submitAnswer.mutateAsync({
        questionIndex: session.currentQuestionIndex,
        answer,
      });

      // Store answer with feedback
      session.setAnswer(answer, response.data);

      // Auto-advance to next question if in "after" mode or if answered correctly
      if (testData?.reviewMode === "after" || response.data.isCorrect) {
        setTimeout(() => {
          if (session.canGoNext) {
            session.goToNext();
          }
        }, testData?.reviewMode === "during" ? 2000 : 500);
      }
    } catch {
      // Error is handled by mutation
    }
  };

  const handleCompleteTest = async () => {
    try {
      await completeTest.mutateAsync();
      // Navigate to results page
      router.push(`/predmety/${subjectId}/temata/${topicId}/zdroje/${sourceId}/testy/${testId}/instance/${instanceId}/vysledky`);
    } catch {
      // Error is handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">{t("taking.loading")}</p>
        </div>
      </div>
    );
  }

  if (isError || !testData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <p className="text-destructive">{t("error.title")}</p>
          <Button onClick={() => router.back()}>{t("common.back")}</Button>
        </div>
      </div>
    );
  }

  const currentAnswer = session.getCurrentAnswer();
  const isAnswered = !!currentAnswer;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="space-y-4">
        <Typography variant="h1">{t("taking.title")}</Typography>

        {/* Progress */}
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t("taking.progress")}
              </span>
              <span className="font-medium">
                {session.currentQuestionIndex + 1} / {session.totalQuestions}
              </span>
            </div>
            <Progress value={session.progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">
              {session.answers.size} {t("taking.answered")}
            </p>
          </div>
        </Card>
      </div>

      {/* Question */}
      <div className="space-y-4">
        {session.currentQuestion.type === "multiple_choice_single" && (
          <MultipleChoiceQuestion
            question={session.currentQuestion}
            initialAnswer={currentAnswer?.answer as string}
            onSubmit={handleAnswerSubmit}
            disabled={isAnswered || submitAnswer.isPending}
            showSubmit={!isAnswered}
          />
        )}

        {session.currentQuestion.type === "multiple_choice_multiple" && (
          <MultipleChoiceQuestion
            question={session.currentQuestion}
            initialAnswer={currentAnswer?.answer as string[]}
            onSubmit={handleAnswerSubmit}
            disabled={isAnswered || submitAnswer.isPending}
            showSubmit={!isAnswered}
          />
        )}

        {session.currentQuestion.type === "true_false" && (
          <TrueFalseQuestion
            question={session.currentQuestion}
            initialAnswer={currentAnswer?.answer as string}
            onSubmit={handleAnswerSubmit}
            disabled={isAnswered || submitAnswer.isPending}
            showSubmit={!isAnswered}
          />
        )}

        {session.currentQuestion.type === "open_ended" && (
          <OpenEndedQuestion
            question={session.currentQuestion}
            initialAnswer={currentAnswer?.answer as string}
            onSubmit={handleAnswerSubmit}
            disabled={isAnswered || submitAnswer.isPending}
            showSubmit={!isAnswered}
          />
        )}

        {/* Feedback (for "during" mode) */}
        {isAnswered && currentAnswer.feedback && testData.reviewMode === "during" && (
          <QuestionFeedback feedback={currentAnswer.feedback} />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={session.goToPrevious}
          disabled={!session.canGoPrevious || submitAnswer.isPending}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {t("taking.previous")}
        </Button>

        <div className="flex gap-2">
          {/* Question dots navigation */}
          {testData.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => session.goToQuestion(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                index === session.currentQuestionIndex
                  ? "bg-primary w-6"
                  : session.answers.has(index)
                  ? "bg-green-500"
                  : "bg-muted"
              }`}
              aria-label={`${t("taking.goToQuestion")} ${index + 1}`}
            />
          ))}
        </div>

        {session.canGoNext ? (
          <Button
            onClick={session.goToNext}
            disabled={submitAnswer.isPending}
          >
            {t("taking.next")}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleCompleteTest}
            disabled={!session.allQuestionsAnswered || completeTest.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {t("taking.complete")}
          </Button>
        )}
      </div>

      {/* Complete Test Warning */}
      {!session.allQuestionsAnswered && !session.canGoNext && (
        <Card className="p-4 bg-orange-50 dark:bg-orange-950/20 border-orange-500">
          <p className="text-sm text-orange-800 dark:text-orange-200">
            {t("taking.notAllAnswered")}
          </p>
        </Card>
      )}
    </div>
  );
}

