"use client";

import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { FileText, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Source } from "@/lib/validations/source";

interface MaterialCardProps {
  material: Source;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onClick?: (id: number) => void;
}

export function MaterialCard({
  material,
  onEdit,
  onDelete,
  onClick,
}: MaterialCardProps) {
  const t = useTranslations("sources");

  const getIcon = () => {
    if (material.type === "note") {
      return <FileText className="h-5 w-5" />;
    }
    // In future, we can differentiate based on sourceType when available
    return <FileText className="h-5 w-5" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileTypeLabel = () => {
    switch (material.type) {
      case "pdf":
        return "PDF";
      case "docx":
        return "DOCX";
      case "doc":
        return "DOC";
      case "txt":
        return "TXT";
      case "note":
        return t("card.note");
      default:
        // This case should never be reached due to exhaustive type checking
        return "FILE";
    }
  };

  return (
    <div
      className={cn(
        "group relative rounded-lg border bg-card p-4 shadow-sm transition-all",
        "hover:shadow-md hover:border-primary/50",
        onClick && "cursor-pointer"
      )}
      onClick={() => onClick?.(material.id)}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 rounded-lg p-3 bg-primary/10">
          <div className="text-primary">{getIcon()}</div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{material.name}</h3>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                <span className="font-medium">{getFileTypeLabel()}</span>
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

              {/* Processing status */}
              {material.status !== "completed" && (
                <div className="mt-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      material.status === "processing" &&
                        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                      material.status === "uploaded" &&
                        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                      material.status === "error" &&
                        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    )}
                  >
                    {t(`card.status.${material.status}`)}
                  </span>
                </div>
              )}

              {/* Stats */}
              {(material.flashcardsCount > 0 || material.testsCount > 0) && (
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  {material.flashcardsCount > 0 && (
                    <span>
                      {t("card.flashcards", {
                        count: material.flashcardsCount,
                      })}
                    </span>
                  )}
                  {material.testsCount > 0 && (
                    <span>
                      {t("card.tests", { count: material.testsCount })}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(material.id);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {t("card.edit")}
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(material.id);
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("card.delete")}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
