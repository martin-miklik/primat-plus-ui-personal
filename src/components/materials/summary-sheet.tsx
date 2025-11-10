"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import {
  Download,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkdownRenderer } from "@/components/chat/markdown-renderer";
import { SummaryPDFDocument } from "@/components/pdf/summary-pdf-document";
import { Source } from "@/lib/validations/source";
import { toast } from "sonner";

interface SummarySheetProps {
  source: Source;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type GenerationState = "idle" | "generating" | "success" | "error";

/**
 * Sheet component that displays source summary with markdown preview
 * and PDF download functionality
 */
export function SummarySheet({
  source,
  open,
  onOpenChange,
}: SummarySheetProps) {
  const t = useTranslations("sources");
  const [generationState, setGenerationState] =
    useState<GenerationState>("idle");

  const handleExportPDF = async () => {
    if (!source.context) {
      toast.error(t("summary.noContent"), {
        description: t("summary.noContentDescription"),
      });
      return;
    }

    setGenerationState("generating");

    try {
      // Generate PDF document
      const doc = (
        <SummaryPDFDocument
          sourceName={source.name}
          content={source.context}
          createdAt={source.createdAt}
        />
      );

      // Convert to blob
      const blob = await pdf(doc).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Sanitize filename (remove special characters)
      const sanitizedName = source.name
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .substring(0, 100);

      link.download = `${sanitizedName}-souhrn.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setGenerationState("success");
      toast.success(t("summary.pdfDownloaded"), {
        description: t("summary.pdfDownloadedDescription", {
          filename: link.download,
        }),
        icon: <CheckCircle2 className="h-5 w-5" />,
      });

      // Reset state after 2 seconds
      setTimeout(() => setGenerationState("idle"), 2000);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      setGenerationState("error");
      toast.error(t("summary.pdfError"), {
        description:
          error instanceof Error
            ? error.message
            : t("summary.pdfErrorDescription"),
        icon: <AlertCircle className="h-5 w-5" />,
      });

      // Reset state after 3 seconds
      setTimeout(() => setGenerationState("idle"), 3000);
    }
  };

  const formattedDate = format(new Date(source.createdAt), "d. MMMM yyyy", {
    locale: cs,
  });

  const isGenerating = generationState === "generating";
  const isSuccess = generationState === "success";
  const hasContent = !!source.context && source.context.trim().length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-3xl p-0 flex flex-col h-full"
      >
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b space-y-3 flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 rounded-lg bg-purple-50 dark:bg-purple-950/20 p-2.5">
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg truncate">
                {source.name}
              </SheetTitle>
              <SheetDescription className="text-sm mt-1">
                {t("summary.title")} • {formattedDate}
              </SheetDescription>
            </div>
          </div>

          {/* Export button */}
          <Button
            onClick={handleExportPDF}
            disabled={!hasContent || isGenerating}
            className="w-full gap-2"
            variant={isSuccess ? "outline" : "default"}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("summary.generating")}
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                {t("summary.downloaded")}
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                {t("summary.exportPdf")}
              </>
            )}
          </Button>
        </SheetHeader>

        {/* Content - Scrollable area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-6 py-4">
            {hasContent ? (
              <div className="prose prose-sm dark:prose-invert max-w-none pb-8">
                <MarkdownRenderer content={source.context!} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {t("summary.emptyTitle")}
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {t("summary.emptyDescription")}
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
