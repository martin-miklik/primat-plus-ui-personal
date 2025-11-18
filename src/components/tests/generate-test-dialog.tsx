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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useDialog } from "@/hooks/use-dialog";
import { usePaywall } from "@/hooks/use-paywall";
import { useGenerateTest } from "@/lib/api/mutations/tests";
import {
  TestConfiguration,
  testConfigurationSchema,
  Difficulty,
  QuestionType,
  ReviewMode,
} from "@/lib/validations/test";
import { ApiError } from "@/lib/errors";
import { FREE_TIER_LIMITS } from "@/lib/constants";

interface GenerateTestDialogProps {
  sourceId: number;
  onTestGenerated?: (testId: string, channel?: string) => void;
}

export function GenerateTestDialog({
  sourceId,
  onTestGenerated,
}: GenerateTestDialogProps) {
  const t = useTranslations("tests");
  const dialog = useDialog("generate-test");
  const { showPaywall, isPremiumUser } = usePaywall();
  const generateTest = useGenerateTest(sourceId);

  const form = useForm<TestConfiguration>({
    resolver: zodResolver(testConfigurationSchema),
    defaultValues: {
      questionCount: 10,
      difficulty: ["medium"],
      questionTypes: ["multiple_choice_single"],
      reviewMode: "during",
    },
  });

  const difficulties: Difficulty[] = ["easy", "medium", "hard"];
  const questionTypes: QuestionType[] = [
    "multiple_choice_single",
    "multiple_choice_multiple",
    "true_false",
    "open_ended",
  ];
  const reviewModes: ReviewMode[] = ["during", "after"];

  const onSubmit = async (data: TestConfiguration) => {
    // Check if free user is trying to generate more questions than allowed
    if (!isPremiumUser && data.questionCount > FREE_TIER_LIMITS.MAX_TEST_QUESTIONS) {
      showPaywall("test_question_limit");
      return;
    }

    try {
      const response = await generateTest.mutateAsync(data);
      onTestGenerated?.(response.data.testId, response.data.channel);
      dialog.close();
      form.reset();
    } catch (error) {
      // Check if backend returned limit error
      if (error instanceof ApiError && error.code === "TEST_QUESTION_LIMIT") {
        showPaywall("test_question_limit");
      }
      // Other errors handled by mutation
    }
  };

  return (
    <Dialog open={dialog.isOpen} onOpenChange={(open) => open ? dialog.open() : dialog.close()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t("generate.title")}
          </DialogTitle>
          <DialogDescription>{t("generate.description")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Question Count */}
            <FormField
              control={form.control}
              name="questionCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("generate.questionCount")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={5}
                      max={isPremiumUser ? 100 : 15}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("generate.questionCountDesc")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Difficulty */}
            <FormField
              control={form.control}
              name="difficulty"
              render={() => (
                <FormItem>
                  <FormLabel>{t("generate.difficulty")}</FormLabel>
                  <div className="space-y-2">
                    {difficulties.map((difficulty) => (
                      <FormField
                        key={difficulty}
                        control={form.control}
                        name="difficulty"
                        render={({ field }) => (
                          <FormItem
                            key={difficulty}
                            className="flex items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(difficulty)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, difficulty])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== difficulty
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {t(`difficulty.${difficulty}`)}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormDescription>
                    {t("generate.difficultyDesc")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Question Types */}
            <FormField
              control={form.control}
              name="questionTypes"
              render={() => (
                <FormItem>
                  <FormLabel>{t("generate.questionTypes")}</FormLabel>
                  <div className="space-y-2">
                    {questionTypes.map((type) => (
                      <FormField
                        key={type}
                        control={form.control}
                        name="questionTypes"
                        render={({ field }) => (
                          <FormItem
                            key={type}
                            className="flex items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(type)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, type])
                                    : field.onChange(
                                        field.value?.filter((value) => value !== type)
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {t(`questionType.${type}`)}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormDescription>
                    {t("generate.questionTypesDesc")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Review Mode */}
            <FormField
              control={form.control}
              name="reviewMode"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{t("generate.reviewMode")}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-2"
                    >
                      {reviewModes.map((mode) => (
                        <div
                          key={mode}
                          className="flex items-center space-x-3 space-y-0"
                        >
                          <RadioGroupItem value={mode} id={mode} />
                          <Label htmlFor={mode} className="font-normal cursor-pointer">
                            <div>
                              <div className="font-medium">
                                {t(`reviewMode.${mode}`)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {t(`reviewMode.${mode}Desc`)}
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
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
                disabled={generateTest.isPending}
              >
                {t("generate.cancel")}
              </Button>
              <Button type="submit" disabled={generateTest.isPending}>
                {generateTest.isPending ? (
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

