"use client";

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
import { usePaywall } from "@/hooks/use-paywall";
import { useCreateSubject } from "@/lib/api/mutations/subjects";
import {
  createSubjectSchema,
  CreateSubjectInput,
} from "@/lib/validations/subject";
import { ApiError } from "@/lib/errors";

/**
 * Create Subject Dialog Component
 *
 * Features:
 * - Form validation with Zod + React Hook Form
 * - Inline error messages via Field API
 * - Loading state during submission
 * - Auto-close and reset on success
 * - Focus trap and accessibility
 * - Esc and backdrop click to close
 */
export function CreateSubjectDialog() {
  const t = useTranslations("subjects.dialog");
  const tCommon = useTranslations("common");
  const dialog = useDialog("create-subject");
  const { checkLimit, showPaywall } = usePaywall();
  const createSubject = useCreateSubject();

  const form = useForm<CreateSubjectInput>({
    resolver: zodResolver(createSubjectSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#6B7280",
      icon: "",
    },
  });

  const onSubmit = async (data: CreateSubjectInput) => {
    // Check limit before attempting to create
    if (!checkLimit("create_subject")) {
      showPaywall("subject_limit");
      return;
    }

    try {
      await createSubject.mutateAsync(data);
      dialog.close();
      form.reset();
    } catch (error) {
      // Check if backend returned limit error
      if (error instanceof ApiError && error.code === "SUBJECT_LIMIT_REACHED") {
        showPaywall("subject_limit");
      }
      // Other errors handled by mutation (toast shown automatically)
    }
  };

  const handleClose = () => {
    dialog.close();
    form.reset();
  };

  return (
    <Dialog
      open={dialog.isOpen}
      onOpenChange={(open) => !open && handleClose()}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("createTitle")}</DialogTitle>
          <DialogDescription>{t("createDescription")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.name}>
              <FieldLabel htmlFor="subject-name">
                {t("nameLabel")} <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="subject-name"
                placeholder={t("namePlaceholder")}
                aria-invalid={!!form.formState.errors.name}
                disabled={createSubject.isPending}
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <FieldError>{form.formState.errors.name.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!form.formState.errors.description}>
              <FieldLabel htmlFor="subject-description">
                {t("descriptionLabel")}
              </FieldLabel>
              <Textarea
                id="subject-description"
                placeholder={t("descriptionPlaceholder")}
                aria-invalid={!!form.formState.errors.description}
                disabled={createSubject.isPending}
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
              id="subject-color"
              value={form.watch("color")}
              onChange={(color) => form.setValue("color", color)}
            />

            <EmojiPicker
              label={t("iconLabel")}
              id="subject-icon"
              value={form.watch("icon")}
              onChange={(emoji) => form.setValue("icon", emoji)}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createSubject.isPending}
              >
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={createSubject.isPending}>
                {createSubject.isPending ? t("creating") : t("createButton")}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
