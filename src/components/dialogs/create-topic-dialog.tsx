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
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { useCreateTopic } from "@/lib/api/mutations/topics";
import { createTopicSchema, CreateTopicInput } from "@/lib/validations/topic";

interface CreateTopicDialogProps {
  subjectId: string;
}

export function CreateTopicDialog({ subjectId }: CreateTopicDialogProps) {
  const t = useTranslations("topics.dialog");
  const tCommon = useTranslations("common");
  const dialog = useDialog("create-topic");
  const createTopic = useCreateTopic(subjectId);

  const form = useForm<CreateTopicInput>({
    resolver: zodResolver(createTopicSchema),
    defaultValues: {
      name: "",
      description: "",
      subjectId: subjectId,
      order: 0,
    },
  });

  const onSubmit = async (data: CreateTopicInput) => {
    try {
      await createTopic.mutateAsync(data);
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

  return (
    <Dialog
      open={dialog.isOpen}
      onOpenChange={(open) => !open && handleClose()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createTitle")}</DialogTitle>
          <DialogDescription>{t("createDescription")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.name}>
              <FieldLabel htmlFor="topic-name">
                {t("nameLabel")} <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="topic-name"
                placeholder={t("namePlaceholder")}
                aria-invalid={!!form.formState.errors.name}
                disabled={createTopic.isPending}
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
                disabled={createTopic.isPending}
              >
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={createTopic.isPending}>
                {createTopic.isPending ? t("creating") : t("createButton")}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}







