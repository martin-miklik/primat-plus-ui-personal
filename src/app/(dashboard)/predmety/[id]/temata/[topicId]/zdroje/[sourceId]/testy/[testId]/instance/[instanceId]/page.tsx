"use client";

import { use, useState, useCallback, useMemo, useEffect } from "react";
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
import { OpenEndedEvaluation } from "@/components/questions/open-ended-evaluation";
import { QuestionFeedback } from "@/components/questions/question-feedback";
import { useTestSession } from "@/hooks/use-test-session";
import { useSubmitAnswer, useCompleteTest } from "@/lib/api/mutations/tests";
import { useTestInstance } from "@/lib/api/queries/test-instance";
import { AnswerFeedbackResponse } from "@/lib/validations/test";
import {
  useTestProgressStore,
  SavedAnswer,
} from "@/stores/test-progress-store";

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
  const { id: subjectId, topicId, sourceId, testId, instanceId } = use(params);
  const t = useTranslations("tests");
  const router = useRouter();

  // Load test instance data
  const {
    data: instanceData,
    isLoading,
    isError,
  } = useTestInstance(instanceId);
  const submitAnswer = useSubmitAnswer(instanceId);
  const completeTest = useCompleteTest(instanceId);

  const testData = instanceData?.data
    ? {
        questions: instanceData.data.questions,
        reviewMode: instanceData.data.reviewMode,
      }
    : null;

  // Restore answers from local storage
  const initialAnswers = useMemo(() => {
    if (!instanceId) return undefined;

    const savedProgress = useTestProgressStore
      .getState()
      .loadProgress(instanceId);
    if (!savedProgress) return undefined;

    const answersMap = new Map();
    savedProgress.answers.forEach((savedAnswer) => {
      answersMap.set(savedAnswer.questionIndex, {
        questionIndex: savedAnswer.questionIndex,
        answer: savedAnswer.answer,
        feedback: savedAnswer.feedback,
      });
    });
    return answersMap;
  }, [instanceId]);

  // Initialize current question index from saved progress
  const [initialQuestionIndex] = useState(() => {
    if (!instanceId) return 0;
    const savedProgress = useTestProgressStore
      .getState()
      .loadProgress(instanceId);
    return savedProgress?.currentQuestionIndex || 0;
  });

  const session = useTestSession(
    testData?.questions || [],
    initialAnswers,
    initialQuestionIndex
  );

  // Save progress whenever answers or current question changes
  useEffect(() => {
    if (!instanceId || session.totalQuestions === 0) return;

    const savedAnswers: SavedAnswer[] = Array.from(
      session.answers.entries()
    ).map(([index, answerState]) => ({
      questionIndex: index,
      answer: answerState.answer,
      feedback: answerState.feedback,
      answeredAt: new Date().toISOString(),
    }));

    useTestProgressStore
      .getState()
      .saveProgress(instanceId, session.currentQuestionIndex, savedAnswers);
  }, [
    instanceId,
    session.answers,
    session.currentQuestionIndex,
    session.totalQuestions,
  ]);

  // State for managing navigation and auto-advance
  const [isNavigating, setIsNavigating] = useState(false);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);
  const [evaluatingOpenEnded, setEvaluatingOpenEnded] = useState<{
    jobId: string;
    channel: string;
  } | null>(null);

  const handleAnswerSubmit = async (answer: string | string[] | boolean) => {
    try {
      const response = await submitAnswer.mutateAsync({
        questionIndex: session.currentQuestionIndex,
        answer,
      });

      // Check if this is an open-ended question with async evaluation
      if (response.data.jobId && response.data.channel) {
        // Open-ended question - show evaluation component
        setEvaluatingOpenEnded({
          jobId: response.data.jobId,
          channel: response.data.channel,
        });
        return;
      }

      // Store answer with feedback
      session.setAnswer(answer, response.data);

      // Auto-advance behavior based on review mode
      if (testData?.reviewMode === "during" && response.data.isCorrect) {
        // In "during" mode with correct answer: auto-advance after 2s
        setIsAutoAdvancing(true);
        setTimeout(() => {
          if (session.canGoNext) {
            session.goToNext();
          }
          setIsAutoAdvancing(false);
        }, 2000);
      }
      // In "after" mode: no auto-advance, user controls navigation
    } catch {
      // Error is handled by mutation
    }
  };

  const handleOpenEndedEvaluationComplete = useCallback(
    (feedback: AnswerFeedbackResponse) => {
      // Store the evaluation result
      session.setAnswer(session.getCurrentAnswer()?.answer || "", feedback);

      // Hide the evaluation component - feedback is now stored in session
      // and will be displayed by QuestionFeedback component
      setEvaluatingOpenEnded(null);
    },
    [session]
  );

  const handleOpenEndedEvaluationError = useCallback((error: string) => {
    console.error("Open-ended evaluation error:", error);
    setEvaluatingOpenEnded(null);
    // Keep the answer but mark as error
  }, []);

  const handleCompleteTest = async () => {
    try {
      await completeTest.mutateAsync();
      // Clear saved progress from local storage
      useTestProgressStore.getState().clearProgress(instanceId);
      // Navigate to results page
      router.push(
        `/predmety/${subjectId}/temata/${topicId}/zdroje/${sourceId}/testy/${testId}/instance/${instanceId}/vysledky`
      );
    } catch {
      // Error is handled by mutation
    }
  };

  // Debounced navigation handlers to prevent double-jumps
  const handleNext = useCallback(() => {
    if (isNavigating || isAutoAdvancing) return;
    setIsNavigating(true);
    session.goToNext();
    setTimeout(() => setIsNavigating(false), 300);
  }, [isNavigating, isAutoAdvancing, session]);

  const handlePrevious = useCallback(() => {
    if (isNavigating || isAutoAdvancing) return;
    setIsNavigating(true);
    session.goToPrevious();
    setTimeout(() => setIsNavigating(false), 300);
  }, [isNavigating, isAutoAdvancing, session]);

  const handleGoToQuestion = useCallback(
    (index: number) => {
      if (isNavigating || isAutoAdvancing) return;

      // In "during" mode, only allow navigation to answered questions
      if (testData?.reviewMode === "during") {
        const targetIsAnswered = session.answers.has(index);
        const currentIsAnswered = session.isCurrentQuestionAnswered;

        // Can't navigate if current question is not answered
        if (!currentIsAnswered) return;

        // Can only navigate to answered questions or the next unanswered one
        if (!targetIsAnswered && index !== session.currentQuestionIndex + 1) {
          return;
        }
      }

      setIsNavigating(true);
      session.goToQuestion(index);
      setTimeout(() => setIsNavigating(false), 300);
    },
    [isNavigating, isAutoAdvancing, session, testData?.reviewMode]
  );

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
  const isAnswered = !!currentAnswer || !!evaluatingOpenEnded;

  // Determine if navigation should be disabled
  const isDuringMode = testData?.reviewMode === "during";
  const canNavigate = !isDuringMode || session.isCurrentQuestionAnswered;
  const isAnyNavigationDisabled =
    isNavigating ||
    isAutoAdvancing ||
    submitAnswer.isPending ||
    !!evaluatingOpenEnded;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Header with Progress (stays at top) */}
      <div className="space-y-4">
        <Typography variant="h1">{t("taking.title")}</Typography>

        {/* Progress Card with Navigation Dots */}
        <Card className="p-4">
          <div className="space-y-4">
            {/* Progress Bar */}
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

            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 flex-wrap">
              {testData.questions.map((_, index) => {
                const answerState = session.answers.get(index);
                const questionAnswered = session.answers.has(index);
                const isCurrent = index === session.currentQuestionIndex;
                const canClickDot =
                  !isAnyNavigationDisabled && (!isDuringMode || canNavigate);

                // Determine dot color based on answer state
                let dotColor = "bg-muted"; // Unanswered
                if (isCurrent) {
                  dotColor = "bg-primary"; // Current
                } else if (questionAnswered) {
                  // Check if correct or incorrect (only in "during" mode with feedback)
                  if (answerState?.feedback?.isCorrect === false) {
                    dotColor = "bg-red-500"; // Incorrect
                  } else if (answerState?.feedback?.isCorrect === true) {
                    dotColor = "bg-green-500"; // Correct
                  } else {
                    dotColor = "bg-blue-500"; // Answered but no feedback yet
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => canClickDot && handleGoToQuestion(index)}
                    disabled={!canClickDot}
                    className={`h-2 rounded-full transition-all ${
                      isCurrent ? "w-6" : "w-2"
                    } ${dotColor} ${
                      canClickDot
                        ? "cursor-pointer hover:scale-125"
                        : "cursor-not-allowed opacity-50"
                    }`}
                    aria-label={`${t("taking.goToQuestion")} ${index + 1}`}
                  />
                );
              })}
            </div>

            {/* Auto-advance indicator */}
            {isAutoAdvancing && (
              <p className="text-xs text-center text-muted-foreground">
                {t("taking.autoAdvancing")}...
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Question */}
      <div className="space-y-4">
        {session.currentQuestion.type === "multiple_choice_single" && (
          <MultipleChoiceQuestion
            key={session.currentQuestionIndex}
            question={session.currentQuestion}
            initialAnswer={currentAnswer?.answer as string}
            onSubmit={handleAnswerSubmit}
            disabled={isAnswered || submitAnswer.isPending || isAutoAdvancing}
            showSubmit={!isAnswered}
            correctAnswer={currentAnswer?.feedback?.correctAnswer as string}
            showFeedback={
              testData.reviewMode === "during" &&
              isAnswered &&
              !!currentAnswer?.feedback
            }
          />
        )}

        {session.currentQuestion.type === "multiple_choice_multiple" && (
          <MultipleChoiceQuestion
            key={session.currentQuestionIndex}
            question={session.currentQuestion}
            initialAnswer={currentAnswer?.answer as string}
            onSubmit={handleAnswerSubmit}
            disabled={isAnswered || submitAnswer.isPending || isAutoAdvancing}
            showSubmit={!isAnswered}
            correctAnswer={currentAnswer?.feedback?.correctAnswer as string}
            showFeedback={
              testData.reviewMode === "during" &&
              isAnswered &&
              !!currentAnswer?.feedback
            }
          />
        )}

        {session.currentQuestion.type === "true_false" && (
          <TrueFalseQuestion
            key={session.currentQuestionIndex}
            question={session.currentQuestion}
            initialAnswer={currentAnswer?.answer as string}
            onSubmit={handleAnswerSubmit}
            disabled={isAnswered || submitAnswer.isPending || isAutoAdvancing}
            showSubmit={!isAnswered}
            correctAnswer={
              currentAnswer?.feedback?.correctAnswer as string | boolean
            }
            showFeedback={
              testData.reviewMode === "during" &&
              isAnswered &&
              !!currentAnswer?.feedback
            }
          />
        )}

        {session.currentQuestion.type === "open_ended" &&
          !evaluatingOpenEnded && (
            <OpenEndedQuestion
              key={session.currentQuestionIndex}
              question={session.currentQuestion}
              initialAnswer={currentAnswer?.answer as string}
              onSubmit={handleAnswerSubmit}
              disabled={isAnswered || submitAnswer.isPending || isAutoAdvancing}
              showSubmit={!isAnswered}
            />
          )}

        {/* Open-ended evaluation (for "during" mode) */}
        {evaluatingOpenEnded && (
          <OpenEndedEvaluation
            channel={evaluatingOpenEnded.channel}
            jobId={evaluatingOpenEnded.jobId}
            questionIndex={session.currentQuestionIndex}
            onComplete={handleOpenEndedEvaluationComplete}
            onError={handleOpenEndedEvaluationError}
          />
        )}

        {/* Feedback (for "during" mode - all question types) */}
        {isAnswered &&
          currentAnswer?.feedback &&
          testData.reviewMode === "during" &&
          !evaluatingOpenEnded && (
            <QuestionFeedback
              feedback={currentAnswer.feedback}
              options={session.currentQuestion.options || []}
              questionType={session.currentQuestion.type}
            />
          )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={
            !session.canGoPrevious ||
            isAnyNavigationDisabled ||
            (isDuringMode && !canNavigate)
          }
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {t("taking.previous")}
        </Button>

        <div className="flex-1" />

        {session.canGoNext ? (
          <Button
            onClick={handleNext}
            disabled={
              isAnyNavigationDisabled ||
              (isDuringMode && !session.isCurrentQuestionAnswered)
            }
          >
            {t("taking.next")}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleCompleteTest}
            disabled={
              !session.allQuestionsAnswered ||
              completeTest.isPending ||
              isAnyNavigationDisabled
            }
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {t("taking.complete")}
          </Button>
        )}
      </div>
    </div>
  );
}
