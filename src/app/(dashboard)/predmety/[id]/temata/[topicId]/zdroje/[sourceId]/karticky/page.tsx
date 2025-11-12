"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Sparkles, BookOpen, AlertCircle, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states/empty-states";
import { FlashcardGrid } from "@/components/flashcards/flashcard-grid";
import { GenerateFlashcardsDialog } from "@/components/dialogs/generate-flashcards-dialog";
import { GenerationProgress } from "@/components/flashcards/generation-progress";
import { Typography } from "@/components/ui/Typography";
import { useDialog } from "@/hooks/use-dialog";
import { useFlashcards, useFlashcardsForRepeat } from "@/lib/api/queries/flashcards";
import { useSource } from "@/lib/api/queries/sources";

interface FlashcardsPageProps {
  params: Promise<{
    id: string;
    topicId: string;
    sourceId: string;
  }>;
}

export default function FlashcardsPage({ params }: FlashcardsPageProps) {
  const {
    id: subjectIdParam,
    topicId: topicIdParam,
    sourceId: sourceIdParam,
  } = use(params);
  const subjectId = Number(subjectIdParam);
  const topicId = Number(topicIdParam);
  const sourceId = Number(sourceIdParam);

  const t = useTranslations("flashcards");
  const router = useRouter();
  const generateDialog = useDialog("generate-flashcards");

  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch source and flashcards
  const { data: sourceData } = useSource(sourceId);
  const {
    data: flashcardsData,
    isLoading,
    isError,
    refetch,
  } = useFlashcards(sourceId);
  const { data: dueFlashcardsData } = useFlashcardsForRepeat(sourceId);

  const source = sourceData?.data;
  const flashcards = flashcardsData?.data || [];
  const dueFlashcards = dueFlashcardsData?.data || [];

  const handleGenerated = () => {
    setIsGenerating(true);
    // Simulate generation time
    setTimeout(() => {
      setIsGenerating(false);
      refetch();
    }, 2000);
  };

  const handleStartPractice = () => {
    router.push(
      `/predmety/${subjectId}/temata/${topicId}/zdroje/${sourceId}/karticky/procvicovat`
    );
  };

  return (
    <>
      <div className="space-y-6 pb-8">
        {/* Page Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
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
          <div className="flex gap-3">
            {flashcards.length > 0 && (
              <Button
                onClick={handleStartPractice}
                disabled={dueFlashcards.length === 0}
                variant="default"
              >
                <GraduationCap className="mr-2 h-4 w-4" />
                {t("page.practice")}
                {dueFlashcards.length > 0 && (
                  <span className="ml-2 text-xs">
                    ({dueFlashcards.length})
                  </span>
                )}
              </Button>
            )}
            <Button onClick={generateDialog.open}>
              <Sparkles className="mr-2 h-4 w-4" />
              {t("page.generate")}
            </Button>
          </div>
        </div>

        {/* Generation Progress */}
        {isGenerating && <GenerationProgress />}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border bg-card p-6 shadow-sm animate-pulse h-48"
              >
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
                  <div className="h-6 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-2/3 mx-auto" />
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
        {!isLoading && !isError && flashcards.length === 0 && (
          <EmptyState
            icon={<BookOpen className="h-12 w-12" />}
            title={t("empty.title")}
            description={t("empty.description")}
            action={{
              label: t("empty.action"),
              onClick: generateDialog.open,
            }}
            className="py-12"
          />
        )}

        {/* Flashcards Grid */}
        {!isLoading && !isError && flashcards.length > 0 && (
          <div className="space-y-4">
            {dueFlashcards.length === 0 && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground text-center">
                  {t("page.noDueCards")}
                </p>
              </div>
            )}
            <FlashcardGrid flashcards={flashcards} />
          </div>
        )}
      </div>

      {/* Generate Dialog */}
      <GenerateFlashcardsDialog
        sourceId={sourceId}
        onGenerated={handleGenerated}
      />
    </>
  );
}



