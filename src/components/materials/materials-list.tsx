"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { Upload, FolderOpen, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states/empty-states";
import { MaterialCard } from "@/components/materials/material-card";
import { MaterialCardSkeleton } from "@/components/materials/material-card-skeleton";
import { UploadMaterialDialog } from "@/components/dialogs/upload-material-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { useUpload } from "@/hooks/use-upload";
import { useMaterials } from "@/lib/api/queries/materials";
import { useSubscription } from "@/hooks/use-centrifuge";
import { useUploadStore } from "@/stores/upload-store";

interface MaterialsListProps {
  topicId: string | null;
  topicName?: string;
}

interface CentrifugoUploadMessage {
  type: "upload_progress" | "upload_complete" | "upload_error";
  materialId: string;
  progress: number;
  status: "uploading" | "processing" | "completed" | "error";
  error?: string;
}

export function MaterialsList({ topicId, topicName }: MaterialsListProps) {
  const t = useTranslations("materials");
  const uploadDialog = useDialog("upload-material");
  const queryClient = useQueryClient();

  // Fetch materials
  const {
    data: materialsData,
    isLoading,
    isError,
    refetch,
  } = useMaterials(topicId || "");

  const materials = materialsData?.data || [];

  // Get uploading files from store
  const allUploadFiles = useUploadStore((state) => state.files);
  const uploadingFiles = useMemo(
    () => allUploadFiles.filter((f) => f.topicId === topicId),
    [allUploadFiles, topicId]
  );
  const removeFile = useUploadStore((state) => state.removeFile);
  const updateFileProgress = useUploadStore(
    (state) => state.updateFileProgress
  );
  const updateFileStatus = useUploadStore((state) => state.updateFileStatus);

  // Initialize upload hook
  useUpload(topicId || "");

  // Subscribe to Centrifugo channel for real-time updates
  useSubscription<CentrifugoUploadMessage>(`materials:${topicId}`, {
    enabled: !!topicId,
    onPublication: (data) => {
      if (data.type === "upload_progress") {
        updateFileProgress(data.materialId, data.progress);
      } else if (data.type === "upload_complete") {
        updateFileStatus(data.materialId, "completed");
        // Refetch materials to show the new one
        queryClient.invalidateQueries({ queryKey: ["materials", topicId] });
      } else if (data.type === "upload_error") {
        updateFileStatus(data.materialId, "error", data.error);
      }
    },
  });

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
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {topicName || t("materials")}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t("materialsForTopic")}
              </p>
            </div>
            <Button onClick={uploadDialog.open}>
              <Upload className="mr-2 h-4 w-4" />
              {t("uploadMaterial")}
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

          {/* Empty State (no materials and no uploads) */}
          {!isLoading &&
            !isError &&
            materials.length === 0 &&
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

          {/* Materials Grid */}
          {!isLoading &&
            !isError &&
            (materials.length > 0 || uploadingFiles.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Upload skeletons */}
                {uploadingFiles.map((uploadFile) => (
                  <MaterialCardSkeleton
                    key={uploadFile.id}
                    uploadFile={uploadFile}
                    onCancel={removeFile}
                  />
                ))}

                {/* Material cards */}
                {materials.map((material) => (
                  <MaterialCard key={material.id} material={material} />
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
