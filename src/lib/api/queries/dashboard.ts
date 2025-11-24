import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api/client";
import { Subject } from "@/lib/validations/subject";
import { Topic } from "@/lib/validations/topic";
import { TestResult } from "@/lib/validations/test";

interface DashboardStats {
  subjectsCount: number;
  topicsCount: number;
  sourcesCount: number;
  flashcardsCount: number;
  dueCardsCount: number;
  testsCompletedCount: number;
  averageTestScore: number;
  studyStreak: number;
  reviewedToday: number;
}

interface RecommendedAction {
  type: string;
  message: string;
  subjectId: number | null;
  subjectName: string | null;
  sourceId: number | null;
  count: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentSubjects: Subject[];
  recentTopics: Topic[];
  recentTests: TestResult[];
  recommendedAction: RecommendedAction;
}

interface DashboardResponse {
  data: DashboardData;
}

export function useDashboardQuery() {
  return useQuery({
    queryKey: ["dashboard"] as const,
    queryFn: () => get<DashboardResponse>("/dashboard"),
  });
}
