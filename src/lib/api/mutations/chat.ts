import { useMutation } from "@tanstack/react-query";
import { post } from "@/lib/api/client";
import { toast } from "sonner";
import { generateChatChannel } from "@/lib/utils/chat-helpers";
import type { ChatModel } from "@/stores/chat-store";

interface SendMessageInput {
  message: string;
  sourceId: number;
  model: ChatModel;
}

interface SendMessageResponse {
  success: boolean;
  channel: string;
  jobId: string;
  status: "queued";
  message?: string;
}

/**
 * Send a chat message to the backend
 */
export function useSendMessage() {
  return useMutation({
    mutationFn: async ({
      message,
      sourceId,
      model,
    }: SendMessageInput): Promise<SendMessageResponse> => {
      const channel = generateChatChannel(sourceId);

      const response = await post<SendMessageResponse>("/chat/send", {
        message,
        sourceId,
        channel,
        model, // Send "fast" or "accurate" directly
      });

      return response;
    },
    onError: (error: Error) => {
      console.error("Failed to send chat message:", error);
      toast.error("Nepodařilo se odeslat zprávu", {
        description: error.message || "Zkuste to prosím znovu.",
      });
    },
  });
}

