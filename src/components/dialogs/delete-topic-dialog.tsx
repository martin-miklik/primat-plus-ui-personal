"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
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
import { useDeleteTopic } from "@/lib/api/mutations/topics";
import { Topic } from "@/lib/validations/topic";

interface DeleteTopicDialogProps {
  topic: Topic | null;
  onDeleted?: (deletedId: string) => void;
}

export function DeleteTopicDialog({
  topic,
  onDeleted,
}: DeleteTopicDialogProps) {
  const t = useTranslations("topics.dialog");
  const tCommon = useTranslations("common");
  const dialog = useDialog("delete-topic");
  const deleteTopic = useDeleteTopic(topic?.subjectId || "");

  const handleDelete = async () => {
    if (!topic) return;

    try {
      await deleteTopic.mutateAsync(topic.id);
      onDeleted?.(topic.id);
      dialog.close();
    } catch {
      // Error handled by mutation (toast shown automatically)
    }
  };

  if (!topic) return null;

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
            {t("deleteConfirmation", { name: topic.name })}
          </p>
          <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <p className="font-medium">{topic.name}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {topic.cardsCount} materiálů
            </p>
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
            disabled={deleteTopic.isPending}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteTopic.isPending}
          >
            {deleteTopic.isPending ? t("deleting") : t("deleteButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}






