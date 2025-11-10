"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FrontendQuestion } from "@/lib/validations/test";
import { cn } from "@/lib/utils";

interface TrueFalseQuestionProps {
  question: FrontendQuestion;
  initialAnswer?: string;
  onSubmit: (answer: string) => void;
  disabled?: boolean;
  showSubmit?: boolean;
}

export function TrueFalseQuestion({
  question,
  initialAnswer,
  onSubmit,
  disabled = false,
  showSubmit = true,
}: TrueFalseQuestionProps) {
  const t = useTranslations("tests");
  const [selected, setSelected] = useState<string | null>(initialAnswer || null);

  const handleSubmit = () => {
    if (!selected) return;
    onSubmit(selected);
  };

  const trueOption = question.options?.find((opt) => opt.id === "true");
  const falseOption = question.options?.find((opt) => opt.id === "false");

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Question Text */}
        <div>
          <h3 className="text-lg font-semibold">{question.question}</h3>
        </div>

        {/* True/False Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* True Button */}
          <button
            onClick={() => !disabled && setSelected("true")}
            disabled={disabled}
            className={cn(
              "flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all",
              "hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20",
              selected === "true"
                ? "border-green-500 bg-green-50 dark:bg-green-950/20 shadow-lg"
                : "border-border",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <CheckCircle2
              className={cn(
                "h-12 w-12",
                selected === "true" ? "text-green-600" : "text-muted-foreground"
              )}
            />
            <span className="font-semibold">
              {trueOption?.text || t("question.true")}
            </span>
          </button>

          {/* False Button */}
          <button
            onClick={() => !disabled && setSelected("false")}
            disabled={disabled}
            className={cn(
              "flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all",
              "hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20",
              selected === "false"
                ? "border-red-500 bg-red-50 dark:bg-red-950/20 shadow-lg"
                : "border-border",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <XCircle
              className={cn(
                "h-12 w-12",
                selected === "false" ? "text-red-600" : "text-muted-foreground"
              )}
            />
            <span className="font-semibold">
              {falseOption?.text || t("question.false")}
            </span>
          </button>
        </div>

        {/* Submit Button */}
        {showSubmit && (
          <Button
            onClick={handleSubmit}
            disabled={!selected || disabled}
            className="w-full"
          >
            {t("question.submit")}
          </Button>
        )}
      </div>
    </Card>
  );
}



