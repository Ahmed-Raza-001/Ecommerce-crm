import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export const MEDIA_KEYS = {
  all: ["media"] as const,
  list: () => [...MEDIA_KEYS.all, "list"] as const,
};

export function useMediaAssets() {
  return useQuery({
    queryKey: MEDIA_KEYS.list(),
    queryFn: () => apiClient.getMediaAssets(),
  });
}

export function useUploadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) =>
      apiClient.uploadFile(file, folder),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: MEDIA_KEYS.all });
      toast.success(`Uploaded ${result.name}`);
    },
    onError: (err: Error) => {
      toast.error(`Upload error: ${err.message}`);
    },
  });
}

export function useDeleteMediaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteMediaAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDIA_KEYS.all });
      toast.success("Media asset deleted");
    },
  });
}
