"use client";

import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useDialog } from "@/hooks/use-dialog";
import { useGenerateFlashcards } from "@/lib/api/mutations/flashcards";
import {
  GenerateFlashcardsInput,
  generateFlashcardsSchema,
} from "@/lib/validations/flashcard";

interface GenerateFlashcardsDialogProps {
  sourceId: number;
  onGenerated?: (jobData: { jobId: string; channel: string; count: number }) => void;
}

export function GenerateFlashcardsDialog({
  sourceId,
  onGenerated,
}: GenerateFlashcardsDialogProps) {
  const t = useTranslations("flashcards");
  const dialog = useDialog("generate-flashcards");
  const generateFlashcards = useGenerateFlashcards(sourceId);

  const form = useForm<GenerateFlashcardsInput>({
    resolver: zodResolver(generateFlashcardsSchema),
    defaultValues: {
      count: 10,
    },
  });

  const onSubmit = async (data: GenerateFlashcardsInput) => {
    try {
      const response = await generateFlashcards.mutateAsync(data);
      
      // Pass job data to parent for WebSocket subscription
      onGenerated?.({
        jobId: response.data.jobId,
        channel: response.data.channel,
        count: data.count,
      });
      
      // Close dialog immediately (don't wait for generation)
      dialog.close();
      form.reset();
    } catch {
      // Error is handled by the mutation
    }
  };

  return (
    <Dialog
      open={dialog.isOpen}
      onOpenChange={(open) => (open ? dialog.open() : dialog.close())}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t("generate.title")}
          </DialogTitle>
          <DialogDescription>{t("generate.description")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Count */}
            <FormField
              control={form.control}
              name="count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("generate.count")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 1)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    {t("generate.countDesc")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  dialog.close();
                  form.reset();
                }}
                disabled={generateFlashcards.isPending}
              >
                {t("generate.cancel")}
              </Button>
              <Button type="submit" disabled={generateFlashcards.isPending}>
                {generateFlashcards.isPending ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                    {t("generate.generating")}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t("generate.submit")}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
