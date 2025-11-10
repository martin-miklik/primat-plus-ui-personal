"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Sparkles, FolderOpen, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states/empty-states";
import { TestCard } from "@/components/tests/test-card";
import { GenerateTestDialog } from "@/components/tests/generate-test-dialog";
import { TestGenerationProgress } from "@/components/tests/test-generation-progress";
import { Typography } from "@/components/ui/Typography";
import { useDialog } from "@/hooks/use-dialog";
import { useTests } from "@/lib/api/queries/tests";
import { useSource } from "@/lib/api/queries/sources";
import { useStartTest } from "@/lib/api/mutations/tests";
import { toast } from "sonner";

interface TestsPageProps {
  params: Promise<{
    id: string;
    topicId: string;
    sourceId: string;
  }>;
}

export default function TestsPage({ params }: TestsPageProps) {
  const {
    id: subjectIdParam,
    topicId: topicIdParam,
    sourceId: sourceIdParam,
  } = use(params);
  const subjectId = Number(subjectIdParam);
  const topicId = Number(topicIdParam);
  const sourceId = Number(sourceIdParam);

  const t = useTranslations("tests");
  const router = useRouter();
  const generateDialog = useDialog("generate-test");

  const [generatingTestId, setGeneratingTestId] = useState<string | null>(null);

  // Fetch source and tests
  const { data: sourceData } = useSource(sourceId);
  const { data: testsData, isLoading, isError, refetch } = useTests(sourceId);

  const source = sourceData?.data;
  const tests = testsData?.data || [];

  const startTestMutation = useStartTest();

  const handleTestGenerated = (testId: string) => {
    setGeneratingTestId(testId);
    // Refetch tests list to show the new generating test
    refetch();
  };

  const handleGenerationComplete = () => {
    setGeneratingTestId(null);
    refetch();
  };

  const handleStartTest = async (testId: string) => {
    try {
      const response = await startTestMutation.mutateAsync(testId);
      const instanceId = response.data.instanceId;

      // Show message if resuming an existing instance
      if (response.data.resumed) {
        toast.success("Pokračujete v rozdělaném testu");
      }

      // Navigate to test taking page
      router.push(`/testy/${testId}/instance/${instanceId}`);
    } catch {
      // Error is handled by the mutation
    }
  };

  return (
    <>
      <div className="space-y-6 pb-8">
        {/* Page Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href={`/predmety/${subjectId}/temata/${topicId}`}>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <Typography variant="h1">
                {t("page.title")}: {source?.name || "..."}
              </Typography>
              <p className="text-muted-foreground mt-2">
                {t("page.description")}
              </p>
            </div>
          </div>
          <Button onClick={generateDialog.open}>
            <Sparkles className="mr-2 h-4 w-4" />
            {t("page.generateTest")}
          </Button>
        </div>

        {/* Generation Progress */}
        {generatingTestId && (
          <TestGenerationProgress
            testId={generatingTestId}
            onComplete={handleGenerationComplete}
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border bg-card p-6 shadow-sm animate-pulse"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 rounded-lg bg-muted h-14 w-14" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-9 bg-muted rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t("error.title")}</h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
              {t("error.description")}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              {t("error.retry")}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && tests.length === 0 && (
          <EmptyState
            icon={<FolderOpen className="h-12 w-12" />}
            title={t("empty.title")}
            description={t("empty.description")}
            action={{
              label: t("empty.action"),
              onClick: generateDialog.open,
            }}
            className="py-12"
          />
        )}

        {/* Tests Grid */}
        {!isLoading && !isError && tests.length > 0 && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {tests.map((test) => (
              <TestCard
                key={test.id}
                test={test}
                onStartTest={handleStartTest}
              />
            ))}
          </div>
        )}
      </div>

      {/* Generate Test Dialog */}
      <GenerateTestDialog
        sourceId={sourceId}
        onTestGenerated={handleTestGenerated}
      />
    </>
  );
}
