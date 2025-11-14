import { useState, useCallback, useMemo } from "react";
import {
  FrontendQuestion,
  AnswerFeedbackResponse,
} from "@/lib/validations/test";

/**
 * Interface for tracking answers in the current test session
 */
interface AnswerState {
  questionIndex: number;
  answer: string | string[] | boolean | null;
  feedback?: AnswerFeedbackResponse;
}

/**
 * Hook for managing test session state
 * Tracks current question, answers, and navigation
 */
export function useTestSession(questions: FrontendQuestion[]) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, AnswerState>>(new Map());

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  // Check if current question is answered
  const isCurrentQuestionAnswered = answers.has(currentQuestionIndex);

  // Check if all questions are answered
  const allQuestionsAnswered = questions.every((_, index) => answers.has(index));

  // Get progress percentage
  const progress = useMemo(() => {
    return totalQuestions > 0
      ? Math.round((answers.size / totalQuestions) * 100)
      : 0;
  }, [answers.size, totalQuestions]);

  // Get current answer
  const getCurrentAnswer = useCallback(() => {
    return answers.get(currentQuestionIndex);
  }, [answers, currentQuestionIndex]);

  // Set answer for current question
  const setAnswer = useCallback(
    (answer: string | string[] | boolean, feedback?: AnswerFeedbackResponse) => {
      setAnswers((prev) => {
        const newAnswers = new Map(prev);
        newAnswers.set(currentQuestionIndex, {
          questionIndex: currentQuestionIndex,
          answer,
          feedback,
        });
        return newAnswers;
      });
    },
    [currentQuestionIndex]
  );

  // Navigation functions
  const goToNext = useCallback(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [currentQuestionIndex, totalQuestions]);

  const goToPrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }, [currentQuestionIndex]);

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestionIndex(index);
    }
  }, [totalQuestions]);

  // Check if navigation is possible
  const canGoNext = currentQuestionIndex < totalQuestions - 1;
  const canGoPrevious = currentQuestionIndex > 0;

  return {
    // Current state
    currentQuestionIndex,
    currentQuestion,
    totalQuestions,
    progress,
    
    // Answer state
    answers,
    isCurrentQuestionAnswered,
    allQuestionsAnswered,
    getCurrentAnswer,
    setAnswer,
    
    // Navigation
    goToNext,
    goToPrevious,
    goToQuestion,
    canGoNext,
    canGoPrevious,
  };
}







