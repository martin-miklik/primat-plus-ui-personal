import { useMutation, useQueryClient } from "@tanstack/react-query";
import { del } from "@/lib/api/client";
import { toast } from "sonner";

interface DeleteResponse {
  success: boolean;
  message?: string;
}

/**
 * Delete Source Mutation
 *
 * Deletes a source and invalidates related queries.
 * Shows success/error toasts automatically.
 */
export function useDeleteSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => del<DeleteResponse>(`/sources/${id}`),
    onSuccess: () => {
      // Invalidate sources queries
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      
      toast.success("Zdroj byl úspěšně smazán");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Nepodařilo se smazat zdroj");
    },
  });
}

