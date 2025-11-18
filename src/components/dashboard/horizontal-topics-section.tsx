"use client";

import { useTranslations } from "next-intl";
import { BookMarked } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { CarouselSection } from "@/components/ui/carousel-section";
import { TopicCard } from "@/components/ui/topic-card";
import { Skeleton } from "@/components/ui/skeleton";
import { NoDataState } from "@/components/states";
import { Topic } from "@/lib/validations/topic";

interface HorizontalTopicsSectionProps {
  topics?: Topic[];
  isLoading: boolean;
}

export function HorizontalTopicsSection({
  topics = [],
  isLoading,
}: HorizontalTopicsSectionProps) {
  const t = useTranslations("dashboard.sections.topics");

  return (
    <div>
      <SectionHeader
        title={t("title")}
        icon={BookMarked}
        viewAllHref="/subjects"
        viewAllLabel={t("viewAll")}
      />

      {isLoading ? (
        <CarouselSection>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-[220px] flex-shrink-0" />
          ))}
        </CarouselSection>
      ) : topics.length === 0 ? (
        <NoDataState
          entityName="topics"
          onCreate={() => (window.location.href = "/subjects")}
          createLabel={t("empty")}
          className="border py-12"
        />
      ) : (
        <CarouselSection>
          {topics.map((topic) => (
            <TopicCard
              key={topic.id}
              id={topic.id}
              name={topic.name}
              subjectId={topic.subjectId}
              subjectName={topic.subjectName}
              subjectColor={topic.subjectColor}
              cardsCount={topic.cardsCount}
              lastStudied={topic.lastStudied}
            />
          ))}
        </CarouselSection>
      )}
    </div>
  );
}























