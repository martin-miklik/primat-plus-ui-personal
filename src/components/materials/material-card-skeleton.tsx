"use client";

import { useTranslations } from "next-intl";
import { FileText, Youtube, Globe, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { UploadFile } from "@/stores/upload-store";

interface MaterialCardSkeletonProps {
  uploadFile: UploadFile;
  onCancel: (id: string) => void;
}

export function MaterialCardSkeleton({
  uploadFile,
  onCancel,
}: MaterialCardSkeletonProps) {
  const t = useTranslations("upload");

  const getIcon = () => {
    switch (uploadFile.sourceType) {
      case "youtube":
        return <Youtube className="h-5 w-5" />;
      case "website":
        return <Globe className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusText = () => {
    switch (uploadFile.status) {
      case "pending":
        return t("status.pending");
      case "uploading":
        return t("status.uploading");
      case "processing":
        return t("status.processing");
      case "error":
        return uploadFile.error || t("status.error");
      default:
        return "";
    }
  };

  const isError = uploadFile.status === "error";
  const isLoading = ["pending", "uploading", "processing"].includes(
    uploadFile.status
  );

  return (
    <div
      className={cn(
        "group relative rounded-lg border bg-card p-4 shadow-sm transition-all",
        "hover:shadow-md",
        isError && "border-destructive bg-destructive/5"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            "flex-shrink-0 rounded-lg p-3 bg-primary/10",
            isError && "bg-destructive/10"
          )}
        >
          <div className={cn("text-primary", isError && "text-destructive")}>
            {getIcon()}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">
                {uploadFile.sourceUrl
                  ? new URL(uploadFile.sourceUrl).hostname
                  : uploadFile.file.name}
              </h3>
              <p
                className={cn(
                  "text-xs text-muted-foreground mt-1 flex items-center gap-2",
                  isError && "text-destructive"
                )}
              >
                {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                {getStatusText()}
              </p>
            </div>

            {/* Cancel Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onCancel(uploadFile.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          {!isError && uploadFile.progress > 0 && (
            <div className="mt-3">
              <Progress value={uploadFile.progress} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-1.5">
                {uploadFile.progress}%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}






