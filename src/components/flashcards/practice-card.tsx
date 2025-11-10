"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Flashcard } from "@/lib/validations/flashcard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Rating,
  RATINGS,
  RATING_LABELS,
  getIntervalLabel,
  getRatingShortcut,
} from "@/lib/utils/spaced-repetition";

interface PracticeCardProps {
  flashcard: Flashcard;
  onRate: (rating: Rating) => void;
  progress: { current: number; total: number; percentage: number };
}

export function PracticeCard({
  flashcard,
  onRate,
  progress,
}: PracticeCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(true);
  };

  const handleRate = useCallback((rating: Rating) => {
    onRate(rating);
    setIsFlipped(false);
  }, [onRate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Space to flip
      if (e.code === "Space" && !isFlipped) {
        e.preventDefault();
        handleFlip();
      }

      // 1-4 to rate (only when flipped)
      if (isFlipped) {
        const rating = parseInt(e.key) as Rating;
        if (rating >= 1 && rating <= 4) {
          e.preventDefault();
          handleRate(rating);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isFlipped, flashcard.id, handleRate]);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Postup</span>
          <span className="font-medium">
            {progress.current} / {progress.total}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress.percentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="perspective-1000">
        <motion.div
          className="relative h-96"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front Side */}
          <div
            className={cn(
              "absolute inset-0 rounded-xl border-2 bg-card p-8 shadow-lg",
              "flex flex-col items-center justify-center text-center",
              "backface-hidden border-blue-500"
            )}
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                Otázka
              </p>
              <p className="text-2xl font-bold">{flashcard.frontSide}</p>
            </div>
            <Button
              onClick={handleFlip}
              size="lg"
              className="mt-6"
            >
              Zobrazit odpověď
              <span className="ml-2 text-xs opacity-70">(Mezerník)</span>
            </Button>
          </div>

          {/* Back Side */}
          <div
            className={cn(
              "absolute inset-0 rounded-xl border-2 bg-card p-8 shadow-lg",
              "flex flex-col",
              "backface-hidden border-green-500"
            )}
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="space-y-4 flex-1 flex flex-col justify-center text-center">
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                Odpověď
              </p>
              <p className="text-2xl font-bold">{flashcard.backSide}</p>
            </div>

            {/* Rating Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <RatingButton
                rating={RATINGS.AGAIN}
                onRate={handleRate}
                variant="destructive"
              />
              <RatingButton
                rating={RATINGS.HARD}
                onRate={handleRate}
                variant="warning"
              />
              <RatingButton
                rating={RATINGS.GOOD}
                onRate={handleRate}
                variant="default"
              />
              <RatingButton
                rating={RATINGS.EASY}
                onRate={handleRate}
                variant="success"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

interface RatingButtonProps {
  rating: Rating;
  onRate: (rating: Rating) => void;
  variant: "destructive" | "warning" | "default" | "success";
}

function RatingButton({ rating, onRate, variant }: RatingButtonProps) {
  const variantClasses = {
    destructive: "border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20",
    warning: "border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20",
    default: "border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20",
    success: "border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20",
  };

  return (
    <Button
      onClick={() => onRate(rating)}
      variant="outline"
      className={cn("flex flex-col h-auto py-3", variantClasses[variant])}
    >
      <span className="font-bold text-lg">{RATING_LABELS[rating]}</span>
      <span className="text-xs text-muted-foreground mt-1">
        {getIntervalLabel(rating)}
      </span>
      <span className="text-xs opacity-50 mt-1">({getRatingShortcut(rating)})</span>
    </Button>
  );
}

