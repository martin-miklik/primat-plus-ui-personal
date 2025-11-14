"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  onFocus?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, onFocus, disabled, placeholder }: ChatInputProps) {
  const t = useTranslations("chat.input");
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setMessage("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter = send (unless Shift is pressed)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }

    // Cmd/Ctrl+K = clear
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setMessage("");
    }
  };

  const isEmpty = message.trim().length === 0;

  return (
    <div className="border-t bg-background p-3 md:p-4">
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            placeholder={placeholder || t("placeholder")}
            disabled={disabled}
            className={cn(
              "min-h-[80px] md:min-h-[100px] max-h-[200px] resize-none pr-2 md:pr-24",
              "focus-visible:ring-1 text-base"
            )}
            rows={1}
          />
          <div className="hidden md:block absolute bottom-3 right-3 text-xs text-muted-foreground">
            {t("hint")}
          </div>
        </div>
        <Button
          onClick={handleSend}
          disabled={disabled || isEmpty}
          size="icon"
          className="h-12 w-12 md:h-14 md:w-14 flex-shrink-0"
        >
          <Send className="h-4 w-4 md:h-5 md:w-5" />
          <span className="sr-only">{t("send")}</span>
        </Button>
      </div>
      {disabled && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {t("disabled")}
        </p>
      )}
    </div>
  );
}

