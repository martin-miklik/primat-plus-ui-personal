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
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/forms/color-picker";
import { EmojiPicker } from "@/components/forms/emoji-picker";
import { useDialog } from "@/hooks/use-dialog";
import { useUpdateSubject } from "@/lib/api/mutations/subjects";
import {
  updateSubjectSchema,
  UpdateSubjectInput,
  Subject,
} from "@/lib/validations/subject";

interface EditSubjectDialogProps {
  subject: Subject | null;
}

/**
 * Edit Subject Dialog Component
 *
 * Features:
 * - Pre-populated form with existing subject data
 * - Color and emoji pickers
 * - Form validation with Zod + React Hook Form
 * - Optimistic updates
 * - Loading state during submission
 * - Auto-close and reset on success
 */
export function EditSubjectDialog({ subject }: EditSubjectDialogProps) {
  const t = useTranslations("subjects.dialog");
  const tCommon = useTranslations("common");
  const dialog = useDialog("edit-subject");
  const updateSubject = useUpdateSubject(subject?.id || "");

  const form = useForm<UpdateSubjectInput>({
    resolver: zodResolver(updateSubjectSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#6B7280",
      icon: "",
    },
  });

  // Update form when subject changes
  useEffect(() => {
    if (subject && dialog.isOpen) {
      form.reset({
        name: subject.name,
        description: subject.description || "",
        color: subject.color || "#6B7280",
        icon: subject.icon || "",
      });
    }
  }, [subject, dialog.isOpen, form]);

  const onSubmit = async (data: UpdateSubjectInput) => {
    if (!subject) return;

    try {
      await updateSubject.mutateAsync(data);
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

  if (!subject) return null;

  return (
    <Dialog
      open={dialog.isOpen}
      onOpenChange={(open) => !open && handleClose()}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("editTitle")}</DialogTitle>
          <DialogDescription>{t("editDescription")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.name}>
              <FieldLabel htmlFor="edit-subject-name">
                {t("nameLabel")} <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="edit-subject-name"
                placeholder={t("namePlaceholder")}
                aria-invalid={!!form.formState.errors.name}
                disabled={updateSubject.isPending}
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <FieldError>{form.formState.errors.name.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!form.formState.errors.description}>
              <FieldLabel htmlFor="edit-subject-description">
                {t("descriptionLabel")}
              </FieldLabel>
              <Textarea
                id="edit-subject-description"
                placeholder={t("descriptionPlaceholder")}
                aria-invalid={!!form.formState.errors.description}
                disabled={updateSubject.isPending}
                rows={3}
                {...form.register("description")}
              />
              <FieldDescription>{t("descriptionHelp")}</FieldDescription>
              {form.formState.errors.description && (
                <FieldError>
                  {form.formState.errors.description.message}
                </FieldError>
              )}
            </Field>

            <ColorPicker
              label={t("colorLabel")}
              id="edit-subject-color"
              value={form.watch("color")}
              onChange={(color) => form.setValue("color", color)}
            />

            <EmojiPicker
              label={t("iconLabel")}
              id="edit-subject-icon"
              value={form.watch("icon")}
              onChange={(emoji) => form.setValue("icon", emoji)}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={updateSubject.isPending}
              >
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={updateSubject.isPending}>
                {updateSubject.isPending ? t("updating") : t("updateButton")}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
