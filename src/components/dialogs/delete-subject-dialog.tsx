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
import { useDeleteSubject } from "@/lib/api/mutations/subjects";
import { Subject } from "@/lib/validations/subject";
import { AlertTriangle } from "lucide-react";

interface DeleteSubjectDialogProps {
  subject: Subject | null;
}

/**
 * Delete Subject Confirmation Dialog
 *
 * Features:
 * - Simple confirmation dialog
 * - Displays subject name being deleted
 * - Uses delete mutation with optimistic updates
 * - Loading state during deletion
 * - Auto-close on success
 */
export function DeleteSubjectDialog({ subject }: DeleteSubjectDialogProps) {
  const t = useTranslations("subjects.dialog");
  const tCommon = useTranslations("common");
  const dialog = useDialog("delete-subject");
  const deleteSubject = useDeleteSubject();

  const handleDelete = async () => {
    if (!subject) return;

    try {
      await deleteSubject.mutateAsync(subject.id);
      dialog.close();
    } catch {
      // Error handled by mutation (toast shown automatically)
    }
  };

  if (!subject) return null;

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
            {t("deleteConfirmation", { name: subject.name })}
          </p>
          <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <div className="flex items-center gap-3">
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: subject.color || "#6B7280" }}
              >
                {subject.icon ? (
                  <span className="text-xl">{subject.icon}</span>
                ) : (
                  <span className="text-xl">📚</span>
                )}
              </div>
              <div>
                <p className="font-medium">{subject.name}</p>
                {subject.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {subject.description}
                  </p>
                )}
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
            disabled={deleteSubject.isPending}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteSubject.isPending}
          >
            {deleteSubject.isPending ? t("deleting") : t("deleteButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
