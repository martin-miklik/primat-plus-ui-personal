import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api/client";
import { Topic } from "@/lib/validations/topic";
import { QUERY_KEYS } from "@/lib/constants";

// API Response types
interface TopicsResponse {
  data: Topic[];
  total: number;
}

interface TopicResponse {
  data: Topic;
}

// Query: Get all topics for a subject
export function useTopics(subjectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.TOPICS(subjectId),
    queryFn: () => get<TopicsResponse>(`/subjects/${subjectId}/topics`),
    enabled: !!subjectId,
  });
}

// Query: Get single topic by ID (optional, for future use)
export function useTopic(topicId: string) {
  return useQuery({
    queryKey: ["topics", topicId],
    queryFn: () => get<TopicResponse>(`/topics/${topicId}`),
    enabled: !!topicId,
  });
}







