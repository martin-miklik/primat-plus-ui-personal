import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api/client";
import { Source } from "@/lib/validations/source";

// API Response types
interface SourcesResponse {
  data: Source[];
  total: number;
}

interface SourceResponse {
  data: Source;
}

// Query: Get all sources (filtered by topicId on frontend)
export function useSources(topicId: number | null) {
  return useQuery({
    queryKey: ["sources", topicId],
    queryFn: async () => {
      const response = await get<SourcesResponse>(`/sources`);
      // Filter by topicId on the frontend since backend returns all sources
      if (topicId) {
        return {
          ...response,
          data: response.data.filter((source) => source.topicId === topicId),
        };
      }
      return response;
    },
    enabled: !!topicId,
  });
}

// Query: Get single source by ID
export function useSource(sourceId: number) {
  return useQuery({
    queryKey: ["sources", "detail", sourceId],
    queryFn: () => get<SourceResponse>(`/sources/${sourceId}`),
    enabled: !!sourceId,
  });
}
