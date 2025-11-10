"use client";

import { use } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/Typography";
import { TestResults } from "@/components/tests/test-results";
import { useTestResults } from "@/lib/api/queries/tests";

interface ResultsPageProps {
  params: Promise<{
    testId: string;
    instanceId: string;
  }>;
}

export default function ResultsPage({ params }: ResultsPageProps) {
  const { testId, instanceId } = use(params);
  const t = useTranslations("tests");

  const { data: resultsData, isLoading, isError, refetch } = useTestResults(instanceId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">{t("results.loading")}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-8">
        <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-12">
          <h3 className="text-lg font-semibold mb-2">{t("error.title")}</h3>
          <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
            {t("error.description")}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            {t("error.retry")}
          </Button>
        </div>
      </div>
    );
  }

  if (!resultsData?.data) {
    return null;
  }

  const results = resultsData.data;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Typography variant="h1">{t("results.title")}</Typography>
          <p className="text-muted-foreground mt-2">
            {t("results.description")}
          </p>
        </div>
      </div>

      {/* Results */}
      <TestResults results={results} />

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
        <Link href="/">
          <Button variant="outline" size="lg">
            <Home className="mr-2 h-4 w-4" />
            {t("results.backHome")}
          </Button>
        </Link>
        <Link href={`/testy/${testId}/instance/${instanceId}`}>
          <Button variant="outline" size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("results.reviewAnswers")}
          </Button>
        </Link>
      </div>
    </div>
  );
}

