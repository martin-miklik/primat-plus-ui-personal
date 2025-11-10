"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ArrowLeft, AlertCircle, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states/empty-states";
import { MaterialCard } from "@/components/materials/material-card";
import { MaterialCardSkeleton } from "@/components/materials/material-card-skeleton";
import { UploadMaterialDialog } from "@/components/dialogs/upload-material-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { useUpload, useUploadSubscription } from "@/hooks/use-upload";
import { useSources } from "@/lib/api/queries/sources";
import { useUploadStore } from "@/stores/upload-store";
import { Typography } from "@/components/ui/Typography";
import { useTopic } from "@/lib/api/queries/topics";

interface TopicDetailPageProps {
  params: Promise<{
    id: string;
    topicId: string;
  }>;
}

/**
 * Component that handles Centrifugo subscription for a single upload
 */
function UploadSubscriptionHandler({ fileId }: { fileId: string }) {
  const uploadFile = useUploadStore((state) =>
    state.files.find((f) => f.id === fileId)
  );

  const isActive =
    uploadFile?.status === "uploading" || uploadFile?.status === "processing";

  useUploadSubscription(fileId, uploadFile?.channel, isActive && !!uploadFile);

  return null;
}

export default function TopicDetailPage({ params }: TopicDetailPageProps) {
  const { id: subjectIdParam, topicId: topicIdParam } = use(params);
  const subjectId = Number(subjectIdParam);
  const topicId = Number(topicIdParam);

  const t = useTranslations("sources");
  const uploadDialog = useDialog("upload-material");

  // Fetch topic and sources
  const { data: topicData } = useTopic(topicId);
  const {
    data: sourcesData,
    isLoading,
    isError,
    refetch,
  } = useSources(topicId);

  const topic = topicData?.data;
  const sources = sourcesData?.data || [];

  // Get uploading files from store and sort them (newest first)
  const allUploadFiles = useUploadStore((state) => state.files);
  const uploadingFiles = useMemo(() => {
    const filtered = allUploadFiles.filter((f) => f.topicId === topicId);
    // Sort by createdAt if available, otherwise reverse to show newest first
    return filtered.sort((a, b) => {
      if (a.sourceData?.createdAt && b.sourceData?.createdAt) {
        return (
          new Date(b.sourceData.createdAt).getTime() -
          new Date(a.sourceData.createdAt).getTime()
        );
      }
      // If no createdAt, newer uploads are at the end of the array, so reverse
      return filtered.indexOf(b) - filtered.indexOf(a);
    });
  }, [allUploadFiles, topicId]);
  const removeFile = useUploadStore((state) => state.removeFile);

  // Initialize upload hook
  useUpload(topicId);

  return (
    <>
      {/* Render subscription handlers for active uploads */}
      {uploadingFiles.map((uploadFile) => (
        <UploadSubscriptionHandler key={uploadFile.id} fileId={uploadFile.id} />
      ))}

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

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border bg-card p-4 shadow-sm animate-pulse h-full"
              >
                <div className="flex flex-col gap-4 h-full">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-shrink-0 rounded-lg bg-muted h-14 w-14" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="h-9 bg-muted rounded" />
                    <div className="h-9 bg-muted rounded" />
                    <div className="h-9 bg-muted rounded" />
                    <div className="h-9 bg-muted rounded" />
                  </div>
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

        {/* Empty State (no sources and no uploads) */}
        {!isLoading &&
          !isError &&
          sources.length === 0 &&
          uploadingFiles.length === 0 && (
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
        {!isLoading &&
          !isError &&
          (sources.length > 0 || uploadingFiles.length > 0) && (
            <AnimatePresence mode="popLayout">
              <motion.div
                className="grid grid-cols-1 gap-4 lg:grid-cols-2 auto-rows-fr"
                layout
              >
                {/* Upload skeletons */}
                {uploadingFiles.map((uploadFile, index) => (
                  <motion.div
                    key={uploadFile.id}
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
                    <MaterialCardSkeleton
                      uploadFile={uploadFile}
                      onCancel={removeFile}
                    />
                  </motion.div>
                ))}

                {/* Source cards */}
                {sources.map((source, index) => (
                  <motion.div
                    key={source.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{
                      delay: (uploadingFiles.length + index) * 0.05,
                      duration: 0.3,
                      ease: "easeOut",
                    }}
                    layout
                  >
                    <MaterialCard material={source} subjectId={subjectId} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
      </div>

      {/* Upload Dialog */}
      <UploadMaterialDialog topicId={topicId} />
    </>
  );
}
