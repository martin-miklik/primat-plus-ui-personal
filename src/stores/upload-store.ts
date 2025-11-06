import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Source } from "@/lib/validations/source";

export interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "processing" | "completed" | "error";
  error?: string;
  sourceId?: number; // ID of created source after upload
  jobId?: string; // Backend job ID for tracking
  channel?: string; // Centrifugo channel for this upload
  topicId: number | null;
  sourceType: "file" | "youtube" | "website";
  url?: string; // For YouTube/Website uploads
  sourceData?: Partial<Source>; // Full source metadata from upload response
}

interface UploadState {
  files: UploadFile[];

  // Actions
  addFiles: (
    files: File[],
    topicId: number | null,
    sourceType: UploadFile["sourceType"],
    url?: string
  ) => void;
  updateFileProgress: (id: string, progress: number) => void;
  updateFileStatus: (
    id: string,
    status: UploadFile["status"],
    error?: string
  ) => void;
  setSourceId: (id: string, sourceId: number) => void;
  setJobData: (id: string, jobId: string, channel: string) => void;
  setSourceData: (id: string, sourceData: Partial<Source>) => void;
  removeFile: (id: string) => void;
  clearCompleted: () => void;
  clearAll: () => void;
}

export const useUploadStore = create<UploadState>()(
  devtools(
    (set) => ({
      files: [],

      addFiles: (newFiles, topicId, sourceType, url) =>
        set(
          (state) => ({
            files: [
              ...state.files,
              ...newFiles.map((file) => ({
                id: crypto.randomUUID(),
                file,
                progress: 0,
                status: "pending" as const,
                topicId,
                sourceType,
                url,
              })),
            ],
          }),
          false,
          "upload/addFiles"
        ),

      updateFileProgress: (id, progress) =>
        set(
          (state) => ({
            files: state.files.map((f) =>
              f.id === id ? { ...f, progress } : f
            ),
          }),
          false,
          "upload/updateFileProgress"
        ),

      updateFileStatus: (id, status, error) =>
        set(
          (state) => ({
            files: state.files.map((f) =>
              f.id === id ? { ...f, status, error } : f
            ),
          }),
          false,
          "upload/updateFileStatus"
        ),

      setSourceId: (id, sourceId) =>
        set(
          (state) => ({
            files: state.files.map((f) =>
              f.id === id ? { ...f, sourceId } : f
            ),
          }),
          false,
          "upload/setSourceId"
        ),

      setJobData: (id, jobId, channel) =>
        set(
          (state) => ({
            files: state.files.map((f) =>
              f.id === id ? { ...f, jobId, channel } : f
            ),
          }),
          false,
          "upload/setJobData"
        ),

      setSourceData: (id, sourceData) =>
        set(
          (state) => ({
            files: state.files.map((f) =>
              f.id === id ? { ...f, sourceData } : f
            ),
          }),
          false,
          "upload/setSourceData"
        ),

      removeFile: (id) =>
        set(
          (state) => ({
            files: state.files.filter((f) => f.id !== id),
          }),
          false,
          "upload/removeFile"
        ),

      clearCompleted: () =>
        set(
          (state) => ({
            files: state.files.filter((f) => f.status !== "completed"),
          }),
          false,
          "upload/clearCompleted"
        ),

      clearAll: () => set({ files: [] }, false, "upload/clearAll"),
    }),
    { name: "UploadStore" }
  )
);
