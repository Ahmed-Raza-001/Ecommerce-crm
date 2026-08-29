import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Product, ProductFormData, ProductFilterParams } from "@/types/product";
import { toast } from "sonner";

export const PRODUCT_KEYS = {
  all: ["products"] as const,
  lists: () => [...PRODUCT_KEYS.all, "list"] as const,
  list: (params?: ProductFilterParams) => [...PRODUCT_KEYS.lists(), params] as const,
  details: () => [...PRODUCT_KEYS.all, "detail"] as const,
  detail: (id: number | string) => [...PRODUCT_KEYS.details(), String(id)] as const,
};

export function useProducts(params?: ProductFilterParams) {
  return useQuery({
    queryKey: PRODUCT_KEYS.list(params),
    queryFn: () => apiClient.getProducts(params),
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useProduct(id: number | string | null) {
  return useQuery({
    queryKey: PRODUCT_KEYS.detail(id || 0),
    queryFn: () => (id ? apiClient.getProduct(id) : null),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductFormData) => apiClient.createProduct(data),
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`Product "${newProduct.title}" created successfully!`);
    },
    onError: (err: Error) => {
      toast.error(`Failed to create product: ${err.message}`);
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<ProductFormData> }) =>
      apiClient.updateProduct(id, data),
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`Product "${updatedProduct.title}" updated!`);
    },
    onError: (err: Error) => {
      toast.error(`Update failed: ${err.message}`);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => apiClient.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Product deleted successfully");
    },
    onError: (err: Error) => {
      toast.error(`Delete failed: ${err.message}`);
    },
  });
}

export function useBulkDeleteProducts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: (number | string)[]) => apiClient.bulkDeleteProducts(ids),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`Deleted ${ids.length} products`);
    },
    onError: (err: Error) => {
      toast.error(`Bulk delete failed: ${err.message}`);
    },
  });
}

export function useBulkUpdateStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: { id: number | string; stock: number }[]) => apiClient.bulkUpdateStock(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Stock levels updated");
    },
  });
}
