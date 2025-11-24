"use client";

import { useTranslations } from "next-intl";
import { FileText } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { CarouselSection } from "@/components/ui/carousel-section";
import { TestCard } from "@/components/ui/test-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/states";
import { TestResult } from "@/lib/validations/test";
import { Inbox } from "lucide-react";

interface HorizontalTestsSectionProps {
  tests?: TestResult[];
  isLoading: boolean;
}

export function HorizontalTestsSection({
  tests = [],
  isLoading,
}: HorizontalTestsSectionProps) {
  const t = useTranslations("dashboard.sections.tests");

  return (
    <div>
      <SectionHeader
        title={t("title")}
        icon={FileText}
        viewAllHref="#"
        viewAllLabel=""
      />

      {isLoading ? (
        <CarouselSection>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-[220px] flex-shrink-0" />
          ))}
        </CarouselSection>
      ) : tests.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-12 w-12" />}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          action={{
            label: t("createTest"),
            onClick: () => (window.location.href = "/predmety"),
          }}
          className="border py-12"
        />
      ) : (
        <CarouselSection>
          {tests.map((test) => (
            <TestCard
              key={test.id}
              id={test.id}
              testId={test.testId}
              name={test.name}
              subjectName={test.subjectName}
              subjectColor={test.subjectColor}
              score={test.score}
              totalQuestions={test.totalQuestions}
              correctAnswers={test.correctAnswers}
              completedAt={test.completedAt}
              subjectId={test.subjectId}
              topicId={test.topicId}
              sourceId={test.sourceId}
            />
          ))}
        </CarouselSection>
      )}
    </div>
  );
}
























