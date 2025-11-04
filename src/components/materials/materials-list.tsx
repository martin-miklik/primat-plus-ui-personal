"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Upload, FolderOpen, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states/empty-states";
import { MaterialCard } from "@/components/materials/material-card";
import { MaterialCardSkeleton } from "@/components/materials/material-card-skeleton";
import { UploadMaterialDialog } from "@/components/dialogs/upload-material-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { useUpload, useUploadSubscription } from "@/hooks/use-upload";
import { useSources } from "@/lib/api/queries/sources";
import { useUploadStore } from "@/stores/upload-store";

interface MaterialsListProps {
  topicId: number | null;
  topicName?: string;
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

  useUploadSubscription(fileId, uploadFile?.channel, isActive);

  return null;
}

export function MaterialsList({ topicId, topicName }: MaterialsListProps) {
  const t = useTranslations("sources");
  const uploadDialog = useDialog("upload-material");

  // Fetch sources
  const {
    data: sourcesData,
    isLoading,
    isError,
    refetch,
  } = useSources(topicId);

  const sources = sourcesData?.data || [];

  // Get uploading files from store
  const allUploadFiles = useUploadStore((state) => state.files);
  const uploadingFiles = useMemo(
    () => allUploadFiles.filter((f) => f.topicId === topicId),
    [allUploadFiles, topicId]
  );
  const removeFile = useUploadStore((state) => state.removeFile);

  // Initialize upload hook
  useUpload(topicId);

  if (!topicId) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <EmptyState
          icon={<FolderOpen className="h-12 w-12" />}
          title={t("noTopicSelected")}
          description={t("selectTopicToView")}
        />
      </div>
    );
  }

  return (
    <>
      {/* Render subscription handlers for active uploads */}
      {uploadingFiles.map((uploadFile) => (
        <UploadSubscriptionHandler key={uploadFile.id} fileId={uploadFile.id} />
      ))}

      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {topicName || t("sources")}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t("sourcesForTopic")}
              </p>
            </div>
            <Button onClick={uploadDialog.open}>
              <Upload className="mr-2 h-4 w-4" />
              {t("uploadSource")}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-10 w-10 text-destructive mb-3" />
              <p className="text-sm font-medium mb-1">{t("error.title")}</p>
              <p className="text-xs text-muted-foreground mb-4">
                {t("error.description")}
              </p>
              <Button onClick={() => refetch()} variant="outline" size="sm">
                {t("error.retry")}
              </Button>
            </div>
          )}

          {/* Empty State (no sources and no uploads) */}
          {!isLoading &&
            !isError &&
            sources.length === 0 &&
            uploadingFiles.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <EmptyState
                  icon={<FolderOpen className="h-12 w-12" />}
                  title={t("empty.title")}
                  description={t("empty.description")}
                  action={{
                    label: t("empty.action"),
                    onClick: uploadDialog.open,
                    variant: "default",
                  }}
                />
              </div>
            )}

          {/* Sources Grid */}
          {!isLoading &&
            !isError &&
            (sources.length > 0 || uploadingFiles.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Upload skeletons */}
                {uploadingFiles.map((uploadFile) => (
                  <MaterialCardSkeleton
                    key={uploadFile.id}
                    uploadFile={uploadFile}
                    onCancel={removeFile}
                  />
                ))}

                {/* Source cards */}
                {sources.map((source) => (
                  <MaterialCard key={source.id} material={source} />
                ))}
              </div>
            )}
        </div>
      </div>

      {/* Upload Dialog */}
      <UploadMaterialDialog topicId={topicId} />
    </>
  );
}
