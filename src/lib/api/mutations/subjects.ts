import { useMutation, useQueryClient } from "@tanstack/react-query";
import { post, patch, del } from "@/lib/api/client";
import {
  Subject,
  CreateSubjectInput,
  UpdateSubjectInput,
} from "@/lib/validations/subject";
import { QUERY_KEYS } from "@/lib/constants";
import { toast } from "sonner";
import { handleMutationError } from "@/lib/utils/paywall-helpers";

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
        id: Date.now(), // Temporary numeric ID
        name: newSubject.name,
        description: newSubject.description,
        color: newSubject.color || "#6B7280",
        icon: newSubject.icon,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        topicsCount: 0,
        sourcesCount: 0,
      };

      // Optimistically add to the list in alphabetical order
      queryClient.setQueryData(
        QUERY_KEYS.SUBJECTS,
        (old: { data: Subject[]; total: number } | undefined) => {
          if (!old) {
            return { data: [optimisticSubject], total: 1 };
          }
          // Insert in alphabetically correct position
          const newData = [...old.data, optimisticSubject].sort((a, b) =>
            a.name.localeCompare(b.name, "cs")
          );
          return {
            data: newData,
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
      // Handle paywall trigger or show error
      const paywallTriggered = handleMutationError(error);
      if (!paywallTriggered) {
        toast.error(error.message || "Failed to create subject");
      }
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
export function useUpdateSubject(id: number) {
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

      // Also update in the list (and re-sort if name changed)
      if (newData.name) {
        queryClient.setQueryData(
          QUERY_KEYS.SUBJECTS,
          (old: { data: Subject[]; total: number } | undefined) => {
            if (!old) return old;
            const updatedData = old.data.map((subject) =>
              subject.id === id ? { ...subject, ...newData } : subject
            );
            // Re-sort alphabetically if name was changed
            const sortedData = updatedData.sort((a, b) =>
              a.name.localeCompare(b.name, "cs")
            );
            return {
              ...old,
              data: sortedData,
            };
          }
        );
      }

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
    mutationFn: (id: number) => del<DeleteResponse>(`/subjects/${id}`),

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
