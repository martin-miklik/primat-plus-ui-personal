import { useMutation, useQueryClient } from "@tanstack/react-query";
import { post, patch, del } from "@/lib/api/client";
import {
  Topic,
  CreateTopicInput,
  UpdateTopicInput,
} from "@/lib/validations/topic";
import { QUERY_KEYS } from "@/lib/constants";
import { toast } from "sonner";

// API Response types
interface TopicResponse {
  data: Topic;
  message?: string;
}

interface DeleteResponse {
  message: string;
}

// Mutation: Create topic
export function useCreateTopic(subjectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTopicInput) =>
      post<TopicResponse>(`/subjects/${subjectId}/topics`, data),

    // Optimistic update
    onMutate: async (newTopic) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.TOPICS(subjectId),
      });

      // Snapshot previous value
      const previousTopics = queryClient.getQueryData(
        QUERY_KEYS.TOPICS(subjectId)
      );

      // Create optimistic topic with temporary ID
      const optimisticTopic: Topic = {
        id: `temp-${Date.now()}`,
        name: newTopic.name,
        description: newTopic.description,
        subjectId: subjectId,
        subjectName: "",
        subjectColor: "",
        order: newTopic.order || 0,
        cardsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistically add to the list
      queryClient.setQueryData(
        QUERY_KEYS.TOPICS(subjectId),
        (old: { data: Topic[]; total: number } | undefined) => {
          if (!old) {
            return { data: [optimisticTopic], total: 1 };
          }
          return {
            data: [...old.data, optimisticTopic],
            total: old.total + 1,
          };
        }
      );

      return { previousTopics };
    },

    onError: (error: Error, _newTopic, context) => {
      // Rollback on error
      if (context?.previousTopics) {
        queryClient.setQueryData(
          QUERY_KEYS.TOPICS(subjectId),
          context.previousTopics
        );
      }
      toast.error(error.message || "Failed to create topic");
    },

    onSuccess: (response) => {
      toast.success(response.message || "Topic created successfully");
    },

    onSettled: () => {
      // Refetch to get real data from server
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TOPICS(subjectId) });
      // Also invalidate the subject to update topic count
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBJECTS });
    },
  });
}

// Mutation: Update topic
export function useUpdateTopic(topicId: string, subjectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTopicInput) =>
      patch<TopicResponse>(`/topics/${topicId}`, data),

    // Optimistic update
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.TOPICS(subjectId),
      });

      // Snapshot previous value
      const previousTopics = queryClient.getQueryData(
        QUERY_KEYS.TOPICS(subjectId)
      );

      // Optimistically update the topic in the list
      queryClient.setQueryData(
        QUERY_KEYS.TOPICS(subjectId),
        (old: { data: Topic[]; total: number } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((topic) =>
              topic.id === topicId
                ? { ...topic, ...newData, updatedAt: new Date().toISOString() }
                : topic
            ),
          };
        }
      );

      return { previousTopics };
    },

    onError: (error: Error, _newData, context) => {
      // Rollback on error
      if (context?.previousTopics) {
        queryClient.setQueryData(
          QUERY_KEYS.TOPICS(subjectId),
          context.previousTopics
        );
      }
      toast.error(error.message || "Failed to update topic");
    },

    onSuccess: (response) => {
      toast.success(response.message || "Topic updated successfully");
    },

    onSettled: () => {
      // Refetch to ensure data is in sync
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TOPICS(subjectId) });
    },
  });
}

// Mutation: Delete topic
export function useDeleteTopic(subjectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => del<DeleteResponse>(`/topics/${id}`),

    // Optimistic update
    onMutate: async (deletedId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.TOPICS(subjectId),
      });

      // Snapshot previous value
      const previousTopics = queryClient.getQueryData(
        QUERY_KEYS.TOPICS(subjectId)
      );

      // Optimistically remove from the list
      queryClient.setQueryData(
        QUERY_KEYS.TOPICS(subjectId),
        (old: { data: Topic[]; total: number } | undefined) => {
          if (!old) return old;
          return {
            data: old.data.filter((topic) => topic.id !== deletedId),
            total: old.total - 1,
          };
        }
      );

      return { previousTopics, deletedId };
    },

    onError: (error: Error, _deletedId, context) => {
      // Rollback on error
      if (context?.previousTopics) {
        queryClient.setQueryData(
          QUERY_KEYS.TOPICS(subjectId),
          context.previousTopics
        );
      }
      toast.error(error.message || "Failed to delete topic");
    },

    onSuccess: (response) => {
      toast.success(response.message || "Topic deleted successfully");
    },

    onSettled: () => {
      // Refetch to ensure data is in sync
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TOPICS(subjectId) });
      // Also invalidate the subject to update topic count
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBJECTS });
    },
  });
}






