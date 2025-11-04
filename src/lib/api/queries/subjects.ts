import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { get } from "@/lib/api/client";
import { Subject } from "@/lib/validations/subject";
import { QUERY_KEYS } from "@/lib/constants";

// API Response types
interface SubjectsResponse {
  data: Subject[];
  total: number;
}

interface SubjectResponse {
  data: Subject;
}

// Query: Get all subjects
export function useSubjects() {
  return useQuery({
    queryKey: QUERY_KEYS.SUBJECTS,
    queryFn: () => get<SubjectsResponse>("/subjects"),
  });
}

// Suspense Query: Get all subjects (throws promise for Suspense)
export function useSuspenseSubjects() {
  return useSuspenseQuery({
    queryKey: QUERY_KEYS.SUBJECTS,
    queryFn: () => get<SubjectsResponse>("/subjects"),
  });
}

// Query: Get single subject by ID
export function useSubject(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.SUBJECT(id),
    queryFn: () => get<SubjectResponse>(`/subjects/${id}`),
    enabled: !!id,
  });
}

// Suspense Query: Get single subject by ID
export function useSuspenseSubject(id: number) {
  return useSuspenseQuery({
    queryKey: QUERY_KEYS.SUBJECT(id),
    queryFn: () => get<SubjectResponse>(`/subjects/${id}`),
  });
}
