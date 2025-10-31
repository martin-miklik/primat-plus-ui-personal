import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api/client";
import { Subject } from "@/lib/validations/subject";
import { Topic } from "@/lib/validations/topic";
import { Card } from "@/lib/validations/card";
import { TestResult } from "@/lib/validations/test";

interface DashboardData {
  recentSubjects: Subject[];
  recentTopics: Topic[];
  recentCards: Card[];
  recentTests: TestResult[];
  dueCardsCount: number;
  studyStreak: number;
  totalCards: number;
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
