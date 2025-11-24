"use client";

import { useTranslations } from "next-intl";
import { Layers } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { CarouselSection } from "@/components/ui/carousel-section";
import { FlashcardPreview } from "@/components/ui/flashcard-preview";
import { Skeleton } from "@/components/ui/skeleton";
import { NoDataState } from "@/components/states";
import { Card } from "@/lib/validations/card";

interface HorizontalCardsSectionProps {
  cards?: Card[];
  isLoading: boolean;
}

export function HorizontalCardsSection({
  cards = [],
  isLoading,
}: HorizontalCardsSectionProps) {
  const t = useTranslations("dashboard.sections.cards");

  return (
    <div>
      <SectionHeader
        title={t("title")}
        icon={Layers}
        viewAllHref="/learn"
        viewAllLabel={t("viewAll")}
      />

      {isLoading ? (
        <CarouselSection>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-[220px] flex-shrink-0" />
          ))}
        </CarouselSection>
      ) : cards.length === 0 ? (
        <NoDataState
          entityName="cards"
          onCreate={() => (window.location.href = "/learn")}
          createLabel={t("empty")}
          className="border py-12"
        />
      ) : (
        <CarouselSection>
          {cards.map((card) => (
            <FlashcardPreview
              key={card.id}
              id={card.id}
              question={card.question}
              subjectId={card.subjectId}
              subjectName={card.subjectName}
              subjectColor={card.subjectColor}
              difficulty={card.difficulty}
              reviewedAt={card.reviewedAt}
            />
          ))}
        </CarouselSection>
      )}
    </div>
  );
}





























