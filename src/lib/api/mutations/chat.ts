import { useMutation } from "@tanstack/react-query";
import { post } from "@/lib/api/client";
import { toast } from "sonner";
import { generateChatChannel } from "@/lib/utils/chat-helpers";
import { handleMutationError } from "@/lib/utils/paywall-helpers";
import type { ChatModel } from "@/stores/chat-store";

interface SendMessageInput {
  message: string;
  sourceId: number;
  model: ChatModel;
}

interface SendMessageData {
  jobId: string;
  channel: string;
  status: "queued";
}

interface SendMessageResponse {
  success: boolean;
  timestamp?: string;
  version?: string;
  data: SendMessageData;
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
    }: SendMessageInput): Promise<SendMessageData> => {
      const channel = generateChatChannel(sourceId);

      const response = await post<SendMessageResponse>("/chat/send", {
        message,
        sourceId,
        channel,
        model, // Send "fast" or "accurate" directly
      });

      // Extract data from nested response structure
      return response.data;
    },
    onError: (error: Error) => {
      console.error("Failed to send chat message:", error);
      // Handle paywall trigger or show error
      const paywallTriggered = handleMutationError(error);
      if (!paywallTriggered) {
        toast.error("Nepodařilo se odeslat zprávu", {
          description: error.message || "Zkuste to prosím znovu.",
        });
      }
    },
  });
}
