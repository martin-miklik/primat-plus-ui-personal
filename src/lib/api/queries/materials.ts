import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api/client";
import { Material } from "@/lib/validations/material";

// API Response types
interface MaterialsResponse {
  data: Material[];
  total: number;
}

interface MaterialResponse {
  data: Material;
}

// Query: Get all materials for a topic
export function useMaterials(topicId: string) {
  return useQuery({
    queryKey: ["materials", topicId],
    queryFn: () => get<MaterialsResponse>(`/topics/${topicId}/materials`),
    enabled: !!topicId,
  });
}

// Query: Get single material by ID
export function useMaterial(materialId: string) {
  return useQuery({
    queryKey: ["materials", "detail", materialId],
    queryFn: () => get<MaterialResponse>(`/materials/${materialId}`),
    enabled: !!materialId,
  });
}







