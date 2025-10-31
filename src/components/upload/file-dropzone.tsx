"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useTranslations } from "next-intl";
import { Upload, X, FileCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from "@/lib/constants";

interface FileWithPreview extends File {
  preview?: string;
  error?: string;
}

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  maxSize?: number;
  acceptedFileTypes?: readonly string[];
}

export function FileDropzone({
  onFilesSelected,
  maxSize = MAX_FILE_SIZE,
  acceptedFileTypes = ALLOWED_FILE_TYPES,
}: FileDropzoneProps) {
  const t = useTranslations("upload");
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > maxSize) {
        return t("errors.fileSize", { size: "50MB" });
      }
      if (!acceptedFileTypes.includes(file.type)) {
        return t("errors.fileType");
      }
      return null;
    },
    [maxSize, acceptedFileTypes, t]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Only take the first file
      const file = acceptedFiles[0];
      if (!file) return;

      const error = validateFile(file);
      const validatedFile = Object.assign(file, { error }) as FileWithPreview;

      // Replace any existing file with the new one
      setFiles([validatedFile]);

      // Only pass valid file to parent
      if (!error) {
        onFilesSelected([file]);
      }
    },
    [validateFile, onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/msword": [".doc"],
      "text/plain": [".txt"],
    },
    maxSize,
  });

  const removeFile = () => {
    setFiles([]);
    onFilesSelected([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
          "hover:border-primary/50 hover:bg-accent/50",
          isDragActive && "border-primary bg-accent",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 rounded-full bg-primary/10">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-base font-medium">{t("dropzone.title")}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t("dropzone.dragDrop")}{" "}
              <span className="text-primary hover:underline">
                {t("dropzone.chooseFile")}
              </span>{" "}
              {t("dropzone.toUpload")}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("dropzone.formats")}
          </p>
        </div>
      </div>

      {/* File Preview */}
      {files.length > 0 && (
        <div
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg border bg-card",
            files[0].error && "border-destructive bg-destructive/5"
          )}
        >
          <div className="flex-shrink-0">
            {files[0].error ? (
              <AlertCircle className="h-5 w-5 text-destructive" />
            ) : (
              <FileCheck className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{files[0].name}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-muted-foreground">
                {formatFileSize(files[0].size)}
              </p>
              {files[0].error && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <p className="text-xs text-destructive">{files[0].error}</p>
                </>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={removeFile}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
