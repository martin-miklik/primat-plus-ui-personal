import { useMutation, useQueryClient } from "@tanstack/react-query";
import { post, patch, del } from "@/lib/api/client";
import {
  Subject,
  CreateSubjectInput,
  UpdateSubjectInput,
} from "@/lib/validations/subject";
import { QUERY_KEYS } from "@/lib/constants";
import { toast } from "sonner";

// API Response types
interface SubjectResponse {
  data: Subject;
  message?: string;
}

interface DeleteResponse {
  message: string;
}

// Mutation: Create subject
export function useCreateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubjectInput) =>
      post<SubjectResponse>("/subjects", data),

    // Optimistic update
    onMutate: async (newSubject) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.SUBJECTS });

      // Snapshot previous value
      const previousSubjects = queryClient.getQueryData(QUERY_KEYS.SUBJECTS);

      // Create optimistic subject with temporary ID
      const optimisticSubject: Subject = {
        id: `temp-${Date.now()}`,
        name: newSubject.name,
        description: newSubject.description,
        color: newSubject.color || "#6B7280",
        icon: newSubject.icon,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        topicsCount: 0,
        materialsCount: 0,
      };

      // Optimistically add to the list
      queryClient.setQueryData(
        QUERY_KEYS.SUBJECTS,
        (old: { data: Subject[]; total: number } | undefined) => {
          if (!old) {
            return { data: [optimisticSubject], total: 1 };
          }
          return {
            data: [optimisticSubject, ...old.data],
            total: old.total + 1,
          };
        }
      );

      return { previousSubjects };
    },

    onError: (error: Error, _newSubject, context) => {
      // Rollback on error
      if (context?.previousSubjects) {
        queryClient.setQueryData(QUERY_KEYS.SUBJECTS, context.previousSubjects);
      }
      toast.error(error.message || "Failed to create subject");
    },

    onSuccess: (response) => {
      toast.success(response.message || "Subject created successfully");
    },

    onSettled: () => {
      // Refetch to get real data from server
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBJECTS });
    },
  });
}

// Mutation: Update subject
export function useUpdateSubject(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSubjectInput) =>
      patch<SubjectResponse>(`/subjects/${id}`, data),

    // Optimistic update
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.SUBJECT(id) });

      // Snapshot previous value
      const previousSubject = queryClient.getQueryData(QUERY_KEYS.SUBJECT(id));

      // Optimistically update to the new value
      queryClient.setQueryData(
        QUERY_KEYS.SUBJECT(id),
        (old: SubjectResponse | undefined) =>
          ({
            ...old,
            data: { ...old?.data, ...newData },
          } as SubjectResponse)
      );

      return { previousSubject };
    },

    onError: (error: Error, _newData, context) => {
      // Rollback on error
      if (context?.previousSubject) {
        queryClient.setQueryData(
          QUERY_KEYS.SUBJECT(id),
          context.previousSubject
        );
      }
      toast.error(error.message || "Failed to update subject");
    },

    onSuccess: (response) => {
      toast.success(response.message || "Subject updated successfully");
    },

    onSettled: () => {
      // Refetch to ensure data is in sync
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBJECT(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBJECTS });
    },
  });
}

// Mutation: Delete subject
export function useDeleteSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => del<DeleteResponse>(`/subjects/${id}`),

    // Optimistic update
    onMutate: async (deletedId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.SUBJECTS });

      // Snapshot previous value
      const previousSubjects = queryClient.getQueryData(QUERY_KEYS.SUBJECTS);

      // Optimistically remove from the list
      queryClient.setQueryData(
        QUERY_KEYS.SUBJECTS,
        (old: { data: Subject[]; total: number } | undefined) => {
          if (!old) return old;
          return {
            data: old.data.filter((subject) => subject.id !== deletedId),
            total: old.total - 1,
          };
        }
      );

      return { previousSubjects };
    },

    onError: (error: Error, _deletedId, context) => {
      // Rollback on error
      if (context?.previousSubjects) {
        queryClient.setQueryData(QUERY_KEYS.SUBJECTS, context.previousSubjects);
      }
      toast.error(error.message || "Failed to delete subject");
    },

    onSuccess: (response, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.SUBJECT(id) });

      toast.success(response.message || "Subject deleted successfully");
    },

    onSettled: () => {
      // Refetch to ensure data is in sync
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBJECTS });
    },
  });
}
