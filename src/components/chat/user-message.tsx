"use client";

import { cn } from "@/lib/utils";
import { formatChatTimestamp } from "@/lib/utils/chat-helpers";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { ChatMessage } from "@/stores/chat-store";

interface UserMessageProps {
  message: ChatMessage;
}

export function UserMessage({ message }: UserMessageProps) {
  return (
    <div className="flex justify-end gap-2 md:gap-3 group">
      <div className="flex flex-col items-end max-w-[85%] md:max-w-[80%]">
        <div
          className={cn(
            "rounded-2xl rounded-tr-sm px-3 py-2 md:px-4 md:py-3",
            "bg-primary text-primary-foreground",
            "shadow-sm"
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        <span className="text-xs text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {formatChatTimestamp(message.timestamp)}
        </span>
      </div>
      <UserAvatar className="flex-shrink-0" />
    </div>
  );
}

