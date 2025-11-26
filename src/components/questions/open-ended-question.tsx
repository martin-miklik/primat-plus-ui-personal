"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FrontendQuestion } from "@/lib/validations/test";

interface OpenEndedQuestionProps {
  question: FrontendQuestion;
  initialAnswer?: string;
  onSubmit: (answer: string) => void;
  disabled?: boolean;
  showSubmit?: boolean;
}

export function OpenEndedQuestion({
  question,
  initialAnswer,
  onSubmit,
  disabled = false,
  showSubmit = true,
}: OpenEndedQuestionProps) {
  const t = useTranslations("tests");
  const [answer, setAnswer] = useState(initialAnswer || "");

  // Reset state when initialAnswer changes (e.g., navigating between questions)
  useEffect(() => {
    setAnswer(initialAnswer || "");
  }, [initialAnswer, question.index]);

  const handleSubmit = () => {
    if (!answer.trim()) return;
    onSubmit(answer);
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Question Text */}
        <div>
          <h3 className="text-lg font-semibold mb-2">{question.question}</h3>
          <p className="text-sm text-muted-foreground">
            {t("question.openEndedHint")}
          </p>
        </div>

        {/* Answer Textarea */}
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={disabled}
          placeholder={t("question.openEndedPlaceholder")}
          className="min-h-[200px] resize-y"
        />

        {/* Character Count */}
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>{t("question.characterCount", { count: answer.length })}</span>
        </div>

        {/* Submit Button */}
        {showSubmit && (
          <Button
            onClick={handleSubmit}
            disabled={!answer.trim() || disabled}
            className="w-full"
          >
            {t("question.submit")}
          </Button>
        )}
      </div>
    </Card>
  );
}








