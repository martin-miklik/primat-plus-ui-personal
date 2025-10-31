"use client";

import { useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useUploadStore } from "@/stores/upload-store";
import {
  API_BASE_URL,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
} from "@/lib/constants";

export function useUpload(topicId: string) {
  const t = useTranslations("upload");
  const { addFiles, updateFileProgress, updateFileStatus, setMaterialId } =
    useUploadStore();

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

        // Simulate progress updates
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 10;
          if (progress <= 90) {
            updateFileProgress(fileId, progress);
          }
        }, 200);

        // Upload file
        const uploadResponse = await fetch(`${API_BASE_URL}/upload`, {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const uploadData = await uploadResponse.json();
        updateFileProgress(fileId, 95);

        // Create material
        const materialResponse = await fetch(
          `${API_BASE_URL}/topics/${topicId}/materials`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: file.name,
              type: getFileType(file),
              fileUrl: uploadData.data.fileUrl,
              fileSize: file.size,
            }),
          }
        );

        if (!materialResponse.ok) {
          throw new Error("Failed to create material");
        }

        const materialData = await materialResponse.json();
        updateFileProgress(fileId, 100);

        // Set material ID and mark as completed
        setMaterialId(fileId, materialData.data.id);
        updateFileStatus(fileId, "completed");

        toast.success(t("success.fileUploaded", { name: file.name }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t("errors.uploadFailed");
        updateFileStatus(fileId, "error", errorMessage);
        toast.error(t("errors.uploadFailed"));
      }
    },
    [updateFileStatus, updateFileProgress, setMaterialId, topicId, t]
  );

  const uploadYoutubeUrl = useCallback(
    async (url: string, fileId: string) => {
      try {
        updateFileStatus(fileId, "processing");

        // Extract video title or use URL as name
        const videoName = new URL(url).searchParams.get("v") || "YouTube Video";

        // Create material from YouTube URL
        const materialResponse = await fetch(
          `${API_BASE_URL}/topics/${topicId}/materials`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: videoName,
              type: "note", // YouTube videos stored as notes for now
              content: url,
            }),
          }
        );

        if (!materialResponse.ok) {
          throw new Error("Failed to create material from YouTube URL");
        }

        const materialData = await materialResponse.json();
        setMaterialId(fileId, materialData.data.id);
        updateFileProgress(fileId, 100);
        updateFileStatus(fileId, "completed");

        toast.success(t("success.youtubeAdded"));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t("errors.uploadFailed");
        updateFileStatus(fileId, "error", errorMessage);
        toast.error(t("errors.uploadFailed"));
      }
    },
    [updateFileStatus, updateFileProgress, setMaterialId, topicId, t]
  );

  const uploadWebsiteUrl = useCallback(
    async (url: string, fileId: string) => {
      try {
        updateFileStatus(fileId, "processing");

        // Extract domain as name
        const websiteName = new URL(url).hostname;

        // Create material from website URL
        const materialResponse = await fetch(
          `${API_BASE_URL}/topics/${topicId}/materials`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: websiteName,
              type: "note", // Websites stored as notes for now
              content: url,
            }),
          }
        );

        if (!materialResponse.ok) {
          throw new Error("Failed to create material from website URL");
        }

        const materialData = await materialResponse.json();
        setMaterialId(fileId, materialData.data.id);
        updateFileProgress(fileId, 100);
        updateFileStatus(fileId, "completed");

        toast.success(t("success.websiteAdded"));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t("errors.uploadFailed");
        updateFileStatus(fileId, "error", errorMessage);
        toast.error(t("errors.uploadFailed"));
      }
    },
    [updateFileStatus, updateFileProgress, setMaterialId, topicId, t]
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
          uploadYoutubeUrl(sourceUrl, uploadFileItem.id);
        } else if (sourceType === "website" && sourceUrl) {
          uploadWebsiteUrl(sourceUrl, uploadFileItem.id);
        }
      });
    },
    [
      addFiles,
      topicId,
      t,
      validateFile,
      uploadSingleFile,
      uploadYoutubeUrl,
      uploadWebsiteUrl,
    ]
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
  }, [topicId, startUpload]);

  return {
    startUpload,
  };
}

function getFileType(file: File): "pdf" | "docx" | "doc" | "txt" | "note" {
  const extension = file.name.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "pdf":
      return "pdf";
    case "docx":
      return "docx";
    case "doc":
      return "doc";
    case "txt":
      return "txt";
    default:
      return "note";
  }
}
