"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ArrowLeft, AlertCircle, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states/empty-states";
import { MaterialCard } from "@/components/materials/material-card";
import { MaterialCardSkeleton } from "@/components/materials/material-card-skeleton";
import { UploadMaterialDialog, DeleteSourceDialog } from "@/components/dialogs";
import { useDialog } from "@/hooks/use-dialog";
import { useUpload } from "@/hooks/use-upload";
import { useSources } from "@/lib/api/queries/sources";
import { useUploadStore } from "@/stores/upload-store";
import { Source } from "@/lib/validations/source";
import { Typography } from "@/components/ui/Typography";
import { useTopic } from "@/lib/api/queries/topics";

interface TopicDetailPageProps {
  params: Promise<{
    id: string;
    topicId: string;
  }>;
}

export default function TopicDetailPage({ params }: TopicDetailPageProps) {
  const { id: subjectIdParam, topicId: topicIdParam } = use(params);
  const subjectId = Number(subjectIdParam);
  const topicId = Number(topicIdParam);

  const t = useTranslations("sources");
  const uploadDialog = useDialog("upload-material");
  const deleteDialog = useDialog("delete-source");
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);

  // Fetch topic and sources
  const { data: topicData } = useTopic(topicId);
  const {
    data: sourcesData,
    isLoading,
    isError,
    refetch,
  } = useSources(topicId);

  const topic = topicData?.data;

  // Get uploading files from store
  const allUploadFiles = useUploadStore((state) => state.files);
  const uploadingFiles = useMemo(
    () => allUploadFiles.filter((f) => f.topicId === topicId),
    [allUploadFiles, topicId]
  );

  // Initialize upload hook
  useUpload(topicId);

  // Map upload files to sources and prepare upload state
  const sourcesWithUploadState = useMemo(() => {
    const sources = sourcesData?.data || [];
    const sourceMap = new Map(sources.map((s) => [s.id, s]));
    const uploadStateMap = new Map(
      uploadingFiles
        .filter((f) => f.sourceId && f.channel && f.jobId)
        .map((f) => [
          f.sourceId!,
          {
            jobId: f.jobId!,
            channel: f.channel!,
            fileId: f.id,
          },
        ])
    );

    // Combine sources with their upload state
    const combined = sources.map((source) => ({
      source,
      uploadState: uploadStateMap.get(source.id),
    }));

    // Add sources that are being uploaded but not yet in the sources list
    // (This happens immediately after upload starts, before the source appears in the API response)
    uploadingFiles.forEach((file) => {
      if (file.sourceData?.id !== undefined && !sourceMap.has(file.sourceData.id)) {
        combined.push({
          source: file.sourceData as typeof sources[number],
          uploadState: file.channel && file.jobId
            ? {
                jobId: file.jobId,
                channel: file.channel,
                fileId: file.id,
              }
            : undefined,
        });
      }
    });

    // Sort: uploading files first, then by createdAt (newest first)
    return combined.sort((a, b) => {
      // Prioritize uploading files (those with uploadState)
      if (a.uploadState && !b.uploadState) return -1;
      if (!a.uploadState && b.uploadState) return 1;
      
      // Both uploading or both not uploading, sort by createdAt
      const dateA = new Date(a.source.createdAt).getTime();
      const dateB = new Date(b.source.createdAt).getTime();
      return dateB - dateA;
    });
  }, [sourcesData?.data, uploadingFiles]);

  const handleDelete = (id: number) => {
    const source = (sourcesData?.data || []).find((s) => s.id === id);
    if (source) {
      setSelectedSource(source);
      deleteDialog.open();
    }
  };

  return (
    <>
      <div className="space-y-6 pb-8">
        {/* Page Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href={`/predmety/${subjectId}`}>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <Typography variant="h1">{topic?.name || "Téma"}</Typography>
              <p className="text-muted-foreground mt-2">
                {t("sourcesForTopic")}
              </p>
            </div>
          </div>
          <Button onClick={uploadDialog.open}>
            <Upload className="mr-2 h-4 w-4" />
            {t("uploadSource")}
          </Button>
        </div>

        {/* Loading State (fetching sources from API) */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <MaterialCardSkeleton key={i} />
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

        {/* Empty State (no sources and no uploads) */}
        {!isLoading &&
          !isError &&
          (sourcesData?.data || []).length === 0 &&
          sourcesWithUploadState.length === 0 && (
            <EmptyState
              icon={<FolderOpen className="h-12 w-12" />}
              title={t("empty.title")}
              description={t("empty.description")}
              action={{
                label: t("empty.action"),
                onClick: uploadDialog.open,
              }}
              className="py-12"
            />
          )}

        {/* Sources Grid */}
        {!isLoading && !isError && sourcesWithUploadState.length > 0 && (
          <AnimatePresence mode="popLayout">
            <motion.div
              className="grid grid-cols-1 gap-4 lg:grid-cols-2 auto-rows-fr"
              layout
            >
              {sourcesWithUploadState.map(({ source, uploadState }, index) => (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    delay: index * 0.05,
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                  layout
                >
                  <MaterialCard
                    material={source}
                    subjectId={subjectId}
                    uploadState={uploadState}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Upload Dialog */}
      <UploadMaterialDialog topicId={topicId} />
      <DeleteSourceDialog source={selectedSource} />
    </>
  );
}
