"use client";

import { motion } from "framer-motion";
import { useDashboardQuery } from "@/lib/api/queries/dashboard";
import { useAuthStore } from "@/stores/auth-store";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { HorizontalSubjectsSection } from "@/components/dashboard/horizontal-subjects-section";
import { HorizontalTopicsSection } from "@/components/dashboard/horizontal-topics-section";
import { HorizontalCardsSection } from "@/components/dashboard/horizontal-cards-section";
import { HorizontalTestsSection } from "@/components/dashboard/horizontal-tests-section";
import { ErrorState } from "@/components/states";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const sectionItem = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboardQuery();
  const user = useAuthStore((state) => state.user);

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <ErrorState onRetry={() => refetch()} className="my-8" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Hero Section */}
      <DashboardHero
        userName={user?.name}
        streak={data?.data.studyStreak}
        dueToday={data?.data.dueCardsCount}
        reviewedToday={12} // TODO: Add to API
        totalCards={data?.data.totalCards}
        isLoading={isLoading}
      />

      {/* Full-width Content Sections */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full space-y-8"
      >
        <motion.div variants={sectionItem}>
          <HorizontalSubjectsSection
            subjects={data?.data.recentSubjects}
            isLoading={isLoading}
          />
        </motion.div>

        <motion.div variants={sectionItem}>
          <HorizontalTopicsSection
            topics={data?.data.recentTopics}
            isLoading={isLoading}
          />
        </motion.div>

        <motion.div variants={sectionItem}>
          <HorizontalCardsSection
            cards={data?.data.recentCards}
            isLoading={isLoading}
          />
        </motion.div>

        <motion.div variants={sectionItem}>
          <HorizontalTestsSection
            tests={data?.data.recentTests}
            isLoading={isLoading}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
