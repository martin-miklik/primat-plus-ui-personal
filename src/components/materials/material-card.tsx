"use client";

import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import Link from "next/link";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Source } from "@/lib/validations/source";
import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui/Typography";

interface MaterialCardProps {
  material: Source;
  subjectId?: number;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onClick?: (id: number) => void;
}

// Source type configuration
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

export function MaterialCard({ material, subjectId }: MaterialCardProps) {
  const t = useTranslations("sources");

  // Get config based on type, fallback to document
  const getSourceConfig = () => {
    const type = material.type as keyof typeof SOURCE_CONFIG;
    if (SOURCE_CONFIG[type]) {
      return SOURCE_CONFIG[type];
    }
    return SOURCE_CONFIG.document;
  };

  const config = getSourceConfig();
  const Icon = config.icon;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getStatusBadge = () => {
    if (material.status === "processed") return null;

    const statusConfig = {
      uploaded: {
        icon: Upload,
        className:
          "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      },
      processing: {
        icon: Sparkles,
        className:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      },
      error: {
        icon: AlertCircle,
        className:
          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      },
    };

    const status = statusConfig[material.status as keyof typeof statusConfig];
    if (!status) return null;

    const StatusIcon = status.icon;

    return (
      <Badge
        variant="secondary"
        className={cn("absolute top-2 right-2 gap-1", status.className)}
      >
        <StatusIcon
          className={cn(
            "h-3 w-3",
            material.status === "processing" && "animate-pulse"
          )}
        />
        <span className="text-xs">{t(`card.status.${material.status}`)}</span>
      </Badge>
    );
  };

  const isProcessed = material.status === "processed";

  const getTypeLabel = () => {
    // For documents, check mimeType for specific format
    if (material.type === "document" && material.mimeType) {
      if (material.mimeType === "application/pdf") return t("card.types.pdf");
      if (
        material.mimeType.includes("word") ||
        material.mimeType.includes("document")
      )
        return t("card.types.docx");
      if (material.mimeType === "text/plain") return t("card.types.txt");
    }
    // Fallback to type translation
    return t(`card.types.${material.type}`);
  };

  return (
    <div
      className={cn(
        "group relative rounded-lg border bg-card shadow-sm transition-all p-0 h-full",
        "hover:shadow-md hover:border-primary/50"
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
          <div className="flex-1 min-w-0">
            <Typography variant="h4" className="truncate">
              {material.name}
            </Typography>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span className={cn("font-medium", config.textColor)}>
                {getTypeLabel()}
              </span>
              {material.fileSize && (
                <>
                  <span>•</span>
                  <span>{formatFileSize(material.fileSize)}</span>
                </>
              )}
              <span>•</span>
              <span>
                {format(new Date(material.createdAt), "d. MMM yyyy", {
                  locale: cs,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <Separator className="my-1" />

        {/* Bottom: Action Buttons - Always visible */}
        <div className="w-full">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-9 rounded-md border-1 border-blue-500 hover:bg-blue-50 dark:border-blue-600 dark:hover:bg-blue-950/20"
              disabled={!isProcessed || !subjectId}
            >
              {isProcessed && subjectId ? (
                <Link 
                  href={`/predmety/${subjectId}/temata/${material.topicId}/zdroje/${material.id}/testy`} 
                  onClick={(e) => e.stopPropagation()}
                >
                  <FileBarChart className="h-3.5 w-3.5" />
                  {t("card.tests")}
                </Link>
              ) : (
                <span>
                  <FileBarChart className="h-3.5 w-3.5" />
                  {t("card.tests")}
                </span>
              )}
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-9 rounded-md border-1 border-green-500  hover:bg-green-50 dark:border-green-600 dark:hover:bg-green-950/20"
              disabled={!isProcessed}
            >
              {isProcessed ? (
                <Link href={`#`} onClick={(e) => e.stopPropagation()}>
                  <BookOpen className="h-3.5 w-3.5" />
                  {t("card.flashcards")}
                </Link>
              ) : (
                <span>
                  <BookOpen className="h-3.5 w-3.5" />
                  {t("card.flashcards")}
                </span>
              )}
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-9 rounded-md border-1 border-purple-500 hover:bg-purple-50 dark:border-purple-600 dark:hover:bg-purple-950/20"
              disabled={!isProcessed}
            >
              {isProcessed ? (
                <Link href={`#`} onClick={(e) => e.stopPropagation()}>
                  <FileText className="h-3.5 w-3.5" />
                  {t("card.summary")}
                </Link>
              ) : (
                <span>
                  <FileText className="h-3.5 w-3.5" />
                  {t("card.summary")}
                </span>
              )}
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-9 rounded-md border-1 border-orange-500  hover:bg-orange-50 dark:border-orange-600  dark:hover:bg-orange-950/20"
              disabled={!isProcessed || !subjectId}
            >
              {isProcessed && subjectId ? (
                <Link 
                  href={`/predmety/${subjectId}/temata/${material.topicId}/zdroje/${material.id}/chat`} 
                  onClick={(e) => e.stopPropagation()}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  {t("card.aiChat")}
                </Link>
              ) : (
                <span>
                  <MessageSquare className="h-3.5 w-3.5" />
                  {t("card.aiChat")}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
