"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { useUpdateTopic } from "@/lib/api/mutations/topics";
import {
  updateTopicSchema,
  UpdateTopicInput,
  Topic,
} from "@/lib/validations/topic";

interface EditTopicDialogProps {
  topic: Topic | null;
}

export function EditTopicDialog({ topic }: EditTopicDialogProps) {
  const t = useTranslations("topics.dialog");
  const tCommon = useTranslations("common");
  const dialog = useDialog("edit-topic");
  const updateTopic = useUpdateTopic(topic?.id || 0, topic?.subjectId || 0);

  const form = useForm<UpdateTopicInput>({
    resolver: zodResolver(updateTopicSchema),
    defaultValues: {
      name: "",
    },
  });

  // Update form when topic changes
  useEffect(() => {
    if (topic && dialog.isOpen) {
      form.reset({
        name: topic.name,
      });
    }
  }, [topic, dialog.isOpen, form]);

  const onSubmit = async (data: UpdateTopicInput) => {
    if (!topic) return;

    try {
      await updateTopic.mutateAsync(data);
      dialog.close();
      form.reset();
    } catch {
      // Error handled by mutation (toast shown automatically)
    }
  };

  const handleClose = () => {
    dialog.close();
    form.reset();
  };

  if (!topic) return null;

  return (
    <Dialog
      open={dialog.isOpen}
      onOpenChange={(open) => !open && handleClose()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("editTitle")}</DialogTitle>
          <DialogDescription>{t("editDescription")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.name}>
              <FieldLabel htmlFor="edit-topic-name">
                {t("nameLabel")} <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="edit-topic-name"
                placeholder={t("namePlaceholder")}
                aria-invalid={!!form.formState.errors.name}
                disabled={updateTopic.isPending}
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <FieldError>{form.formState.errors.name.message}</FieldError>
              )}
            </Field>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={updateTopic.isPending}
              >
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={updateTopic.isPending}>
                {updateTopic.isPending ? t("updating") : t("updateButton")}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}








