"use client";

import { useTranslations } from "next-intl";
import { Brain, Plus, FileText, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionCard } from "@/components/ui/action-card";

export function QuickActionsWidget() {
  const t = useTranslations("dashboard.quickActions");

  return (
    <Card className="border-none shadow-none py-0">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ActionCard
          title={t("learn.title")}
          description={t("learn.description")}
          icon={Brain}
          href="/learn"
          variant="primary"
        />
        <ActionCard
          title={t("newSubject.title")}
          description={t("newSubject.description")}
          icon={Plus}
          href="/predmety?action=create"
        />
        <ActionCard
          title={t("takeTest.title")}
          description={t("takeTest.description")}
          icon={FileText}
          href="/predmety"
        />
        <ActionCard
          title={t("statistics.title")}
          description={t("statistics.description")}
          icon={BarChart3}
          href="/stats"
        />
      </CardContent>
    </Card>
  );
}








