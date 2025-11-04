"use client";

import { useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { useUploadStore } from "@/stores/upload-store";
import { useSubscription } from "@/hooks/use-centrifuge";
import { SourceProcessingMessage } from "@/types/centrifugo";
import {
  API_BASE_URL,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
} from "@/lib/constants";

export function useUpload(topicId: number | null) {
  const t = useTranslations("upload");
  const queryClient = useQueryClient();
  const {
    addFiles,
    updateFileProgress,
    updateFileStatus,
    setSourceId,
    setJobData,
  } = useUploadStore();

  // Track active subscriptions
  const subscriptionsRef = useRef<Map<string, () => void>>(new Map());

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > MAX_FILE_SIZE) {
        return t("errors.fileSize", { size: "50MB" });
      }
      if (
        !ALLOWED_FILE_TYPES.includes(
          file.type as (typeof ALLOWED_FILE_TYPES)[number]
        )
      ) {
        return t("errors.fileType");
      }
      return null;
    },
    [t]
  );

  const uploadSingleFile = useCallback(
    async (file: File, fileId: string) => {
      try {
        // Update status to uploading
        updateFileStatus(fileId, "uploading");

        // Create form data
        const formData = new FormData();
        formData.append("file", file);
        formData.append("topicId", String(topicId));

        // Upload file to real backend endpoint
        const response = await fetch(`${API_BASE_URL}/sources`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const responseData = await response.json();

        // Backend returns: { success: true, data: { id, jobId, channel, ... }, timestamp, version }
        const { id: sourceId, jobId, channel } = responseData.data || responseData;

        // Store the source ID and job data
        setSourceId(fileId, sourceId);
        setJobData(fileId, jobId, channel);

        // Update to processing status (backend will send updates via Centrifugo)
        updateFileStatus(fileId, "processing");

        toast.success(t("success.fileUploaded", { name: file.name }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t("errors.uploadFailed");
        updateFileStatus(fileId, "error", errorMessage);
        toast.error(t("errors.uploadFailed"));
      }
    },
    [
      updateFileStatus,
      setSourceId,
      setJobData,
      topicId,
      t,
    ]
  );

  const uploadFromUrl = useCallback(
    async (url: string, fileId: string, name: string) => {
      try {
        updateFileStatus(fileId, "processing");

        // Create source from URL (YouTube or Website)
        const response = await fetch(`${API_BASE_URL}/sources`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            topicId: topicId,
            url: url,
            name: name,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create source from URL");
        }

        const responseData = await response.json();

        // Backend returns: { success: true, data: { id, jobId, channel, ... }, timestamp, version }
        const { id: sourceId, jobId, channel } = responseData.data || responseData;

        // Store the source ID and job data
        setSourceId(fileId, sourceId);
        setJobData(fileId, jobId, channel);

        toast.success(
          url.includes("youtube") || url.includes("youtu.be")
            ? t("success.youtubeAdded")
            : t("success.websiteAdded")
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t("errors.uploadFailed");
        updateFileStatus(fileId, "error", errorMessage);
        toast.error(t("errors.uploadFailed"));
      }
    },
    [updateFileStatus, setSourceId, setJobData, topicId, t]
  );

  const startUpload = useCallback(
    (
      files: File[],
      sourceType: "file" | "youtube" | "website",
      sourceUrl?: string
    ) => {
      // Validate files if type is file
      if (sourceType === "file") {
        const invalidFiles = files.filter((f) => validateFile(f) !== null);
        if (invalidFiles.length > 0) {
          toast.error(t("errors.invalidFiles"));
          return;
        }
      }

      // Add files to store
      addFiles(files, topicId, sourceType, sourceUrl);

      // Get the newly added files
      const store = useUploadStore.getState();
      const newFiles = store.files.slice(-files.length);

      // Start upload for each file
      newFiles.forEach((uploadFileItem) => {
        if (sourceType === "file") {
          uploadSingleFile(uploadFileItem.file, uploadFileItem.id);
        } else if (sourceType === "youtube" && sourceUrl) {
          uploadFromUrl(sourceUrl, uploadFileItem.id, "YouTube Video");
        } else if (sourceType === "website" && sourceUrl) {
          const websiteName = new URL(sourceUrl).hostname;
          uploadFromUrl(sourceUrl, uploadFileItem.id, websiteName);
        }
      });
    },
    [addFiles, topicId, t, validateFile, uploadSingleFile, uploadFromUrl]
  );

  // Listen for upload events from dialog
  useEffect(() => {
    const handleFileUpload = (e: Event) => {
      const { files } = (e as CustomEvent).detail;
      startUpload(files, "file");
    };

    const handleYoutubeUpload = (e: Event) => {
      const { url } = (e as CustomEvent).detail;
      // Create a fake file for tracking
      const fakeFile = new File([""], "YouTube Video", { type: "text/plain" });
      startUpload([fakeFile], "youtube", url);
    };

    const handleWebsiteUpload = (e: Event) => {
      const { url } = (e as CustomEvent).detail;
      // Create a fake file for tracking
      const fakeFile = new File([""], "Website", { type: "text/plain" });
      startUpload([fakeFile], "website", url);
    };

    window.addEventListener("upload:files", handleFileUpload);
    window.addEventListener("upload:youtube", handleYoutubeUpload);
    window.addEventListener("upload:website", handleWebsiteUpload);

    return () => {
      window.removeEventListener("upload:files", handleFileUpload);
      window.removeEventListener("upload:youtube", handleYoutubeUpload);
      window.removeEventListener("upload:website", handleWebsiteUpload);
    };
  }, [startUpload]);

  // Subscribe to Centrifugo channels for active uploads
  useEffect(() => {
    const store = useUploadStore.getState();
    const activeUploads = store.files.filter(
      (f) =>
        f.topicId === topicId &&
        f.channel &&
        (f.status === "uploading" || f.status === "processing")
    );

    // Clean up subscriptions for completed/error uploads
    subscriptionsRef.current.forEach((unsubscribe, fileId) => {
      const upload = store.files.find((f) => f.id === fileId);
      if (
        !upload ||
        upload.status === "completed" ||
        upload.status === "error"
      ) {
        unsubscribe();
        subscriptionsRef.current.delete(fileId);
      }
    });

    // Note: The actual subscription logic is handled by a separate component
    // that renders subscriptions for each upload. This is because useSubscription
    // is a hook and can't be called conditionally in a loop.
  }, [topicId]);

  return {
    startUpload,
  };
}

/**
 * Hook to subscribe to a specific upload's Centrifugo channel
 * This should be used in a component that renders for each active upload
 */
export function useUploadSubscription(
  fileId: string,
  channel: string | undefined,
  enabled: boolean
) {
  const queryClient = useQueryClient();
  const { updateFileProgress, updateFileStatus, files } = useUploadStore();
  const t = useTranslations("upload");

  const uploadFile = files.find((f) => f.id === fileId);
  const topicId = uploadFile?.topicId;

  useSubscription<SourceProcessingMessage>(channel || "", {
    enabled: enabled && !!channel,
    onPublication: (data) => {
      switch (data.type) {
        case "processing":
          // Backend started processing
          updateFileStatus(fileId, "processing");
          updateFileProgress(fileId, 10);
          break;

        case "gemini_chunk":
          // AI is generating content (streaming)
          // Update progress gradually from 10% to 90%
          const currentFile = useUploadStore.getState().files.find(f => f.id === fileId);
          const currentProgress = currentFile?.progress || 10;
          if (currentProgress < 90) {
            updateFileProgress(fileId, Math.min(currentProgress + 2, 90));
          }
          break;

        case "gemini_complete":
          // AI generation finished
          updateFileProgress(fileId, 95);
          break;

        case "completed":
          // Full processing done
          updateFileProgress(fileId, 100);
          updateFileStatus(fileId, "completed");
          // Refetch sources to show the new one
          if (topicId) {
            queryClient.invalidateQueries({ queryKey: ["sources", topicId] });
          }
          toast.success(t("success.processingComplete"));
          break;

        case "error":
        case "gemini_error":
          // Processing failed
          updateFileStatus(fileId, "error", data.error);
          toast.error(t("errors.processingFailed"));
          break;
      }
    },
    onError: (error) => {
      console.error(`Subscription error for ${fileId}:`, error);
      updateFileStatus(fileId, "error", error.message);
    },
  });
}
