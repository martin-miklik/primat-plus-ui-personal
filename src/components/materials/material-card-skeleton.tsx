"use client";

import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import {
  FileText,
  Video,
  Globe,
  Sparkles,
  BookOpen,
  MessageSquare,
  FileBarChart,
  Upload,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { UploadFile } from "@/stores/upload-store";
import { Typography } from "@/components/ui/Typography";

interface MaterialCardSkeletonProps {
  uploadFile?: UploadFile;
  onCancel: (id: string) => void;
}

// Source type configuration matching MaterialCard
const SOURCE_CONFIG = {
  document: {
    icon: FileText,
    color: "#3B82F6", // Blue for documents
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    textColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  youtube: {
    icon: Video,
    color: "#EF4444", // Red for YouTube
    bgColor: "bg-red-50 dark:bg-red-950/20",
    textColor: "text-red-600 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-800",
  },
  webpage: {
    icon: Globe,
    color: "#10B981", // Green for web pages
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    textColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-200 dark:border-emerald-800",
  },
  website: {
    icon: Globe,
    color: "#10B981", // Green for websites
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    textColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-200 dark:border-emerald-800",
  },
};

export function MaterialCardSkeleton({
  uploadFile,
  onCancel,
}: MaterialCardSkeletonProps) {
  const t = useTranslations("sources");
  const tUpload = useTranslations("upload");

  // Safety check: if uploadFile is undefined, render nothing
  if (!uploadFile) {
    return null;
  }

  // Get config based on source type (prefer sourceData.type if available)
  const getConfig = () => {
    const sourceType = uploadFile.sourceData?.type || uploadFile.sourceType;
    
    if (sourceType === "youtube") return SOURCE_CONFIG.youtube;
    if (sourceType === "webpage" || sourceType === "website") return SOURCE_CONFIG.website;
    // Default to document for files
    return SOURCE_CONFIG.document;
  };

  const config = getConfig();
  const Icon = config.icon;

  const isError = uploadFile.status === "error";
  const isUploading = uploadFile.status === "uploading";
  const isProcessing = uploadFile.status === "processing";

  // Only show badge for processing and error states (not during upload)
  const getStatusBadge = () => {
    if (uploadFile.status === "error") {
      return (
        <Badge
          variant="secondary"
          className="absolute top-2 right-2 gap-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        >
          <AlertCircle className="h-3 w-3" />
          <span className="text-xs">{tUpload("status.error")}</span>
        </Badge>
      );
    }

    // Only show processing badge when status is processing (comes from websocket)
    if (uploadFile.status === "processing") {
      return (
        <Badge
          variant="secondary"
          className="absolute top-2 right-2 gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
        >
          <Sparkles className="h-3 w-3 animate-pulse" />
          <span className="text-xs">{tUpload("status.processing")}</span>
        </Badge>
      );
    }

    // No badge during upload - progress bar will show instead
    return null;
  };

  const getFileName = () => {
    // Prefer sourceData name if available
    if (uploadFile.sourceData?.name) {
      return uploadFile.sourceData.name;
    }
    if (uploadFile.url) {
      try {
        return new URL(uploadFile.url).hostname;
      } catch {
        return uploadFile.url;
      }
    }
    return uploadFile.file.name;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getTypeLabel = () => {
    if (!uploadFile.sourceData) return "";
    
    const { type, mimeType } = uploadFile.sourceData;
    
    // For documents, check mimeType for specific format
    if (type === "document" && mimeType) {
      if (mimeType === "application/pdf") return t("card.types.pdf");
      if (mimeType.includes("word") || mimeType.includes("document"))
        return t("card.types.docx");
      if (mimeType === "text/plain") return t("card.types.txt");
    }
    // Fallback to type translation
    return type ? t(`card.types.${type}`) : "";
  };

  return (
    <div
      className={cn(
        "group relative rounded-lg border bg-card shadow-sm transition-all p-0 h-full",
        "hover:shadow-md hover:border-primary/50",
        isError && "border-destructive/50"
      )}
    >
      {/* Status Badge */}
      {getStatusBadge()}

      {/* Card Content */}
      <div className="flex flex-col gap-4 p-4 h-full">
        {/* Top: Icon + Info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div
            className={cn(
              "flex-shrink-0 rounded-lg p-3 transition-colors",
              config.bgColor
            )}
          >
            <Icon className="h-5 w-5" style={{ color: config.color }} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <Typography variant="h4" className="truncate">
              {getFileName()}
            </Typography>
            
            {/* Show progress bar during upload */}
            {isUploading && uploadFile.progress > 0 && (
              <div className="space-y-1">
                <Progress value={uploadFile.progress} className="h-1.5" />
                <p className="text-xs text-muted-foreground">
                  {tUpload("status.uploading")} • {uploadFile.progress}%
                </p>
              </div>
            )}
            
            {/* Show metadata after upload completes (from sourceData) */}
            {!isUploading && uploadFile.sourceData && !isError && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {getTypeLabel() && (
                  <span className={cn("font-medium", config.textColor)}>
                    {getTypeLabel()}
                  </span>
                )}
                {uploadFile.sourceData.fileSize && (
                  <>
                    <span>•</span>
                    <span>{formatFileSize(uploadFile.sourceData.fileSize)}</span>
                  </>
                )}
                {uploadFile.sourceData.createdAt && (
                  <>
                    <span>•</span>
                    <span>
                      {format(new Date(uploadFile.sourceData.createdAt), "d. M. yyyy", {
                        locale: cs,
                      })}
                    </span>
                  </>
                )}
              </div>
            )}
            
            {/* Show error message if error */}
            {isError && (
              <p className="text-xs text-destructive font-medium">
                {uploadFile.error || tUpload("status.error")}
              </p>
            )}
          </div>
        </div>

        {/* Divider */}
        <Separator className="my-1" />

        {/* Bottom: Action Buttons - Disabled during upload/processing */}
        <div className="w-full">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-9 rounded-md border-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-950/20"
              disabled
            >
              <FileBarChart className="h-3.5 w-3.5" />
              {t("card.tests")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-9 rounded-md border-2 border-green-500 text-green-600 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-950/20"
              disabled
            >
              <BookOpen className="h-3.5 w-3.5" />
              {t("card.flashcards")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-9 rounded-md border-2 border-purple-500 text-purple-600 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:hover:bg-purple-950/20"
              disabled
            >
              <FileText className="h-3.5 w-3.5" />
              {t("card.summary")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-9 rounded-md border-2 border-orange-500 text-orange-600 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-950/20"
              disabled
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {t("card.aiChat")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
