"use client";

import { use, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PracticeCard } from "@/components/flashcards/practice-card";
import { PracticeComplete } from "@/components/flashcards/practice-complete";
import { Typography } from "@/components/ui/Typography";
import { useFlashcardsForRepeat } from "@/lib/api/queries/flashcards";
import { useUpdateNextRepetition } from "@/lib/api/mutations/flashcards";
import { useFlashcardStore } from "@/stores/flashcard-store";
import {
  Rating,
  calculateMinutesOffset,
} from "@/lib/utils/spaced-repetition";

interface PracticePageProps {
  params: Promise<{
    id: string;
    topicId: string;
    sourceId: string;
  }>;
}

export default function PracticePage({ params }: PracticePageProps) {
  const {
    id: subjectIdParam,
    topicId: topicIdParam,
    sourceId: sourceIdParam,
  } = use(params);
  const subjectId = Number(subjectIdParam);
  const topicId = Number(topicIdParam);
  const sourceId = Number(sourceIdParam);

  const t = useTranslations("flashcards");
  const router = useRouter();

  // Fetch due flashcards
  const { data: dueFlashcardsData, isLoading } =
    useFlashcardsForRepeat(sourceId);
  const dueFlashcards = useMemo(
    () => dueFlashcardsData?.data || [],
    [dueFlashcardsData]
  );

  // Store state
  const {
    cards,
    isActive,
    startSession,
    nextCard,
    markCompleted,
    resetSession,
    getCurrentCard,
    getProgress,
    isSessionComplete,
  } = useFlashcardStore();

  const currentCard = getCurrentCard();
  const progress = getProgress();

  // Initialize session when due cards are loaded
  useEffect(() => {
    if (dueFlashcards.length > 0 && !isActive) {
      startSession(dueFlashcards);
    }
  }, [dueFlashcards, isActive, startSession]);

  // Redirect if no cards due
  useEffect(() => {
    if (!isLoading && dueFlashcards.length === 0) {
      router.push(
        `/predmety/${subjectId}/temata/${topicId}/zdroje/${sourceId}/karticky`
      );
    }
  }, [isLoading, dueFlashcards.length, router, subjectId, topicId, sourceId]);

  const updateNextRepetitionMutation = useUpdateNextRepetition(
    sourceId,
    currentCard?.id || ""
  );

  const handleRate = async (rating: Rating) => {
    if (!currentCard) return;

    const minutesOffset = calculateMinutesOffset(rating);

    try {
      // Update next repetition on backend
      await updateNextRepetitionMutation.mutateAsync({ minutesOffset });

      // Mark as completed and move to next card
      markCompleted();
      nextCard();
    } catch (error) {
      // Error is handled by mutation, but we should still move to next card
      console.error("Failed to update next repetition:", error);
      markCompleted();
      nextCard();
    }
  };

  const handleReturn = () => {
    resetSession();
    router.push(
      `/predmety/${subjectId}/temata/${topicId}/zdroje/${sourceId}/karticky`
    );
  };

  const handleExit = () => {
    resetSession();
    router.push(
      `/predmety/${subjectId}/temata/${topicId}/zdroje/${sourceId}/karticky`
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{t("practice.loading")}</p>
        </div>
      </div>
    );
  }

  // Session complete
  if (isSessionComplete()) {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={handleExit}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Typography variant="h1">{t("practice.title")}</Typography>
        </div>
        <PracticeComplete cardsCompleted={cards.length} onReturn={handleReturn} />
      </div>
    );
  }

  // Practice mode
  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={handleExit}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Typography variant="h1">{t("practice.title")}</Typography>
        </div>
        <Button variant="outline" onClick={handleExit}>
          {t("practice.exit")}
        </Button>
      </div>

      {/* Practice Card */}
      {currentCard && (
        <PracticeCard
          flashcard={currentCard}
          onRate={handleRate}
          progress={progress}
        />
      )}

      {/* Keyboard shortcuts hint */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {t("practice.shortcuts")}
        </p>
      </div>
    </div>
  );
}

