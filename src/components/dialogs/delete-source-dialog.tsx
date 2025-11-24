"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { useDeleteSource } from "@/lib/api/mutations/sources";
import { Source } from "@/lib/validations/source";
import { AlertTriangle, FileText, Video, Globe } from "lucide-react";

interface DeleteSourceDialogProps {
  source: Source | null;
}

const ICON_MAP = {
  document: FileText,
  youtube: Video,
  webpage: Globe,
};

/**
 * Delete Source Confirmation Dialog
 *
 * Features:
 * - Simple confirmation dialog
 * - Displays source name and type being deleted
 * - Uses delete mutation with optimistic updates
 * - Loading state during deletion
 * - Auto-close on success
 */
export function DeleteSourceDialog({ source }: DeleteSourceDialogProps) {
  const t = useTranslations("sources.dialog");
  const tCommon = useTranslations("common");
  const dialog = useDialog("delete-source");
  const deleteSource = useDeleteSource();

  const handleDelete = async () => {
    if (!source) return;

    try {
      await deleteSource.mutateAsync(source.id);
      dialog.close();
    } catch {
      // Error handled by mutation (toast shown automatically)
    }
  };

  if (!source) return null;

  const Icon = ICON_MAP[source.type as keyof typeof ICON_MAP] || FileText;

  return (
    <Dialog
      open={dialog.isOpen}
      onOpenChange={(open) => !open && dialog.close()}
    >
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>{t("deleteTitle")}</DialogTitle>
              <DialogDescription>{t("deleteDescription")}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            {t("deleteConfirmation", { name: source.name })}
          </p>
          <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{source.name}</p>
                <p className="text-sm text-muted-foreground">
                  {source.type === "document" && "Dokument"}
                  {source.type === "youtube" && "YouTube video"}
                  {source.type === "webpage" && "Webová stránka"}
                </p>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {t("deleteWarning")}
          </p>
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => dialog.close()}
            disabled={deleteSource.isPending}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteSource.isPending}
          >
            {deleteSource.isPending ? t("deleting") : t("deleteButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

