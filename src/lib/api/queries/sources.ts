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
        const filteredData = response.data.filter(
          (source) => source.topicId === topicId
        );
        // Sort by createdAt (newest first)
        const sortedData = filteredData.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        return {
          ...response,
          data: sortedData,
        };
      }
      // Sort all sources by createdAt (newest first)
      const sortedData = response.data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return {
        ...response,
        data: sortedData,
      };
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
