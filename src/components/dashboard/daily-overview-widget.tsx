"use client";

import { useTranslations } from "next-intl";
import { Flame, Target, CheckCircle2, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";

interface DailyOverviewWidgetProps {
  streak?: number;
  dueToday?: number;
  reviewedToday?: number;
  totalCards?: number;
  isLoading: boolean;
}

export function DailyOverviewWidget({
  streak = 0,
  dueToday = 0,
  reviewedToday = 0,
  totalCards = 0,
  isLoading,
}: DailyOverviewWidgetProps) {
  const t = useTranslations("dashboard.dailyOverview");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <StatCard
          icon={Flame}
          value={streak}
          label={t("streak")}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-500/10"
        />
        <StatCard
          icon={Target}
          value={dueToday}
          label={t("dueToday")}
          iconColor="text-primary"
          iconBgColor="bg-primary/10"
        />
        <StatCard
          icon={CheckCircle2}
          value={reviewedToday}
          label={t("reviewedToday")}
          iconColor="text-green-600"
          iconBgColor="bg-green-500/10"
        />
        <StatCard
          icon={Layers}
          value={totalCards}
          label={t("totalCards")}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-500/10"
        />
      </CardContent>
    </Card>
  );
}

























