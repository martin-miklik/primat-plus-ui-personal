"use client";

import { Flashcard } from "@/lib/validations/flashcard";
import { FlashcardCard } from "./flashcard-card";
import { EmptyState } from "@/components/states/empty-states";
import { BookOpen } from "lucide-react";

interface FlashcardGridProps {
  flashcards: Flashcard[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function FlashcardGrid({
  flashcards,
  emptyTitle = "Žádné kartičky",
  emptyDescription = "Zatím nemáte žádné kartičky k procvičování.",
}: FlashcardGridProps) {
  if (flashcards.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen className="h-12 w-12" />}
        title={emptyTitle}
        description={emptyDescription}
        className="py-12"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {flashcards.map((flashcard) => (
        <FlashcardCard key={flashcard.id} flashcard={flashcard} />
      ))}
    </div>
  );
}






