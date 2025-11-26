"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FrontendQuestion } from "@/lib/validations/test";
import { cn } from "@/lib/utils";

interface MultipleChoiceQuestionProps {
  question: FrontendQuestion;
  initialAnswer?: string;
  onSubmit: (answer: string) => void;
  disabled?: boolean;
  showSubmit?: boolean;
  correctAnswer?: string | string[]; // For showing visual feedback
  showFeedback?: boolean; // Whether to show correct/incorrect indicators
}

export function MultipleChoiceQuestion({
  question,
  initialAnswer,
  onSubmit,
  disabled = false,
  showSubmit = true,
  correctAnswer,
  showFeedback = false,
}: MultipleChoiceQuestionProps) {
  const t = useTranslations("tests");
  const isMultiple = question.type === "multiple_choice_multiple";
  
  // Parse correct answers for comparison
  const correctIds = correctAnswer 
    ? (Array.isArray(correctAnswer) 
        ? correctAnswer 
        : String(correctAnswer).split(",").map(id => id.trim()))
    : [];
  
  // Check if an option is correct
  const isOptionCorrect = (optionId: string) => correctIds.includes(optionId);
  
  // Check if an option was selected
  const isOptionSelected = (optionId: string) => {
    return isMultiple 
      ? selectedMultiple.includes(optionId)
      : selectedSingle === optionId;
  };

  const [selectedSingle, setSelectedSingle] = useState<string>(
    initialAnswer || ""
  );
  const [selectedMultiple, setSelectedMultiple] = useState<string[]>(
    initialAnswer ? initialAnswer.split(",").filter(Boolean) : []
  );

  // Reset state when initialAnswer changes (e.g., navigating between questions)
  useEffect(() => {
    if (isMultiple) {
      setSelectedMultiple(initialAnswer ? initialAnswer.split(",").filter(Boolean) : []);
    } else {
      setSelectedSingle(initialAnswer || "");
    }
  }, [initialAnswer, isMultiple, question.index]);

  const hasAnswer = isMultiple
    ? selectedMultiple.length > 0
    : selectedSingle !== "";

  const handleSubmit = () => {
    if (!hasAnswer) return;
    onSubmit(isMultiple ? selectedMultiple.join(",") : selectedSingle);
  };

  const handleMultipleToggle = (optionId: string) => {
    setSelectedMultiple((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Question Text */}
        <div>
          <h3 className="text-lg font-semibold mb-2">{question.question}</h3>
          {isMultiple && (
            <p className="text-sm text-muted-foreground">
              {t("question.selectMultiple")}
            </p>
          )}
        </div>

        {/* Options */}
        {isMultiple ? (
          // Multiple choice - multiple answers
          <div className="space-y-3">
            {question.options?.map((option) => {
              const selected = isOptionSelected(option.id);
              const correct = isOptionCorrect(option.id);
              const showIndicator = showFeedback && (selected || correct);
              
              return (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-center space-x-3 rounded-lg border p-4 transition-colors",
                    !disabled && "cursor-pointer hover:bg-accent",
                    selected && !showFeedback && "border-primary bg-accent",
                    showFeedback && correct && "border-green-500 bg-green-50 dark:bg-green-950/20",
                    showFeedback && selected && !correct && "border-red-500 bg-red-50 dark:bg-red-950/20"
                  )}
                  onClick={() => !disabled && handleMultipleToggle(option.id)}
                >
                  <Checkbox
                    id={option.id}
                    checked={selectedMultiple.includes(option.id)}
                    onCheckedChange={() => !disabled && handleMultipleToggle(option.id)}
                    disabled={disabled}
                  />
                  <Label
                    htmlFor={option.id}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    {option.text}
                  </Label>
                  {showIndicator && (
                    <span className="text-lg">
                      {correct ? "✓" : selected && "✗"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // Multiple choice - single answer
          <RadioGroup
            value={selectedSingle}
            onValueChange={setSelectedSingle}
            disabled={disabled}
            className="space-y-3"
          >
            {question.options?.map((option) => {
              const selected = isOptionSelected(option.id);
              const correct = isOptionCorrect(option.id);
              const showIndicator = showFeedback && (selected || correct);
              
              return (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-center space-x-3 rounded-lg border p-4 transition-colors",
                    !disabled && "cursor-pointer hover:bg-accent",
                    selected && !showFeedback && "border-primary bg-accent",
                    showFeedback && correct && "border-green-500 bg-green-50 dark:bg-green-950/20",
                    showFeedback && selected && !correct && "border-red-500 bg-red-50 dark:bg-red-950/20"
                  )}
                  onClick={() => !disabled && setSelectedSingle(option.id)}
                >
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label
                    htmlFor={option.id}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    {option.text}
                  </Label>
                  {showIndicator && (
                    <span className="text-lg">
                      {correct ? "✓" : selected && "✗"}
                    </span>
                  )}
                </div>
              );
            })}
          </RadioGroup>
        )}

        {/* Submit Button */}
        {showSubmit && (
          <Button
            onClick={handleSubmit}
            disabled={!hasAnswer || disabled}
            className="w-full"
          >
            {t("question.submit")}
          </Button>
        )}
      </div>
    </Card>
  );
}

