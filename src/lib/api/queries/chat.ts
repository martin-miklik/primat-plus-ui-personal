import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api/client";

export interface ChatHistoryItem {
  id: number;
  question: string;
  answer: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string | null;
}

interface GetChatHistoryResponse {
  success: boolean;
  sourceId: number;
  chats: ChatHistoryItem[];
  count: number;
}

/**
 * Fetch chat history for a source from the backend
 */
export function useGetChatHistory(sourceId: number, enabled = true) {
  return useQuery({
    queryKey: ["chat", "source", sourceId],
    queryFn: async () => {
      const response = await get<GetChatHistoryResponse>(
        `/chat/source/${sourceId}`
      );
      return response;
    },
    enabled,
    staleTime: 1000 * 60 * 5, // Consider fresh for 5 minutes
    refetchOnMount: true, // Always refetch on mount to get latest
    refetchOnWindowFocus: false,
  });
}

