"use client";

import { Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { ChatModel } from "@/stores/chat-store";

interface ModelToggleProps {
  value: ChatModel;
  onChange: (value: ChatModel) => void;
  disabled?: boolean;
}

export function ModelToggle({ value, onChange, disabled }: ModelToggleProps) {
  const t = useTranslations("chat.models");

  // TODO: Enable "accurate" model when Gemini Pro is available
  const accurateModelAvailable = true;

  return (
    <TooltipProvider>
      <div className="bg-muted/50 rounded-lg p-1 border border-border flex gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange("fast")}
              disabled={disabled}
              className={cn(
                "gap-1.5 px-3 py-1.5 h-auto transition-all rounded-md",
                value === "fast"
                  ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              aria-pressed={value === "fast"}
            >
              <Zap className="h-3.5 w-3.5" />
              <span className="text-sm font-medium">{t("fast")}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{t("fastTooltip")}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange("accurate")}
              disabled={disabled || !accurateModelAvailable}
              className={cn(
                "gap-1.5 px-3 py-1.5 h-auto transition-all rounded-md",
                value === "accurate"
                  ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                !accurateModelAvailable && "opacity-50 cursor-not-allowed"
              )}
              aria-pressed={value === "accurate"}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-sm font-medium">{t("accurate")}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">
              {accurateModelAvailable 
                ? t("accurateTooltip") 
                : "Přesný model není momentálně dostupný"}
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
