"use client";

import { useState } from "react";
import { Sparkles, Copy, Check } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatChatTimestamp } from "@/lib/utils/chat-helpers";
import { MarkdownRenderer } from "./markdown-renderer";
import type { ChatMessage } from "@/stores/chat-store";

interface AssistantMessageProps {
  message: ChatMessage;
}

export function AssistantMessage({ message }: AssistantMessageProps) {
  const t = useTranslations("chat");
  const [copied, setCopied] = useState(false);

  const isStreaming = message.status === "streaming";
  const isError = message.status === "error";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success(t("actions.copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Nepodařilo se zkopírovat");
    }
  };

  return (
    <div className="flex gap-2 md:gap-3 group">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <Sparkles className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col max-w-[85%] md:max-w-[80%] flex-1">
        <div
          className={cn(
            "rounded-2xl rounded-tl-sm px-3 py-2 md:px-4 md:py-3",
            "bg-muted",
            "shadow-sm relative",
            isError && "border-2 border-destructive"
          )}
        >
          {/* Model badge */}
          {message.model && (
            <Badge
              variant="secondary"
              className="absolute -top-2 right-2 text-[10px] px-1.5 py-0 h-4"
            >
              {message.model === "fast" ? "⚡ Rychlý" : "✨ Přesný"}
            </Badge>
          )}

          {/* Copy button */}
          {!isStreaming && !isError && message.content && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          )}

          {/* Message content */}
          {isError ? (
            <div className="text-sm text-destructive">
              {message.content || t("errors.generic")}
            </div>
          ) : (
            <>
              <MarkdownRenderer content={message.content} />
              {/* Streaming cursor */}
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-foreground ml-1 animate-pulse" />
              )}
            </>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground mt-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {formatChatTimestamp(message.timestamp)}
        </span>
      </div>
    </div>
  );
}

