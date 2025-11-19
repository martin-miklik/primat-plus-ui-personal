"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Flashcard } from "@/lib/validations/flashcard";
import { cn } from "@/lib/utils";

interface FlashcardCardProps {
  flashcard: Flashcard;
  className?: string;
}

export function FlashcardCard({ flashcard, className }: FlashcardCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className={cn("perspective-1000", className)}>
      <motion.div
        className="relative h-48 cursor-pointer"
        onClick={handleFlip}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front Side */}
        <div
          className={cn(
            "absolute inset-0 rounded-lg border-2 bg-card p-6 shadow-md",
            "flex items-center justify-center text-center",
            "backface-hidden border-blue-500"
          )}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">Otázka</p>
            <p className="text-lg font-semibold">{flashcard.frontSide}</p>
          </div>
        </div>

        {/* Back Side */}
        <div
          className={cn(
            "absolute inset-0 rounded-lg border-2 bg-card p-6 shadow-md",
            "flex items-center justify-center text-center",
            "backface-hidden border-green-500"
          )}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">Odpověď</p>
            <p className="text-lg font-semibold">{flashcard.backSide}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}








