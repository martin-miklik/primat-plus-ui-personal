"use client";

import { useTranslations } from "next-intl";
import { BookOpen } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { CarouselSection } from "@/components/ui/carousel-section";
import { SubjectCard } from "@/components/ui/subject-card";
import { Skeleton } from "@/components/ui/skeleton";
import { NoDataState } from "@/components/states";
import { Subject } from "@/lib/validations/subject";

interface HorizontalSubjectsSectionProps {
  subjects?: Subject[];
  isLoading: boolean;
}

export function HorizontalSubjectsSection({
  subjects = [],
  isLoading,
}: HorizontalSubjectsSectionProps) {
  const t = useTranslations("dashboard.sections.subjects");

  return (
    <div>
      <SectionHeader
        title={t("title")}
        icon={BookOpen}
        viewAllHref="/predmety"
        viewAllLabel={t("viewAll")}
      />

      {isLoading ? (
        <CarouselSection>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-[220px] flex-shrink-0" />
          ))}
        </CarouselSection>
      ) : subjects.length === 0 ? (
        <NoDataState
          entityName="subjects"
          onCreate={() => (window.location.href = "/predmety")}
          createLabel={t("empty")}
          className="border py-12"
        />
      ) : (
        <CarouselSection>
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              id={subject.id}
              name={subject.name}
              icon={subject.icon}
              color={subject.color}
              topicsCount={subject.topicsCount}
              sourcesCount={subject.sourcesCount}
              variant="grid"
            />
          ))}
        </CarouselSection>
      )}
    </div>
  );
}
