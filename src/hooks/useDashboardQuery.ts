import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => apiClient.getDashboardStats(),
    refetchInterval: 1000 * 30, // Refresh every 30s
  });
}

export function useBackendHealth() {
  return useQuery({
    queryKey: ["backend", "health"],
    queryFn: () => apiClient.checkBackendHealth(),
    refetchInterval: 1000 * 15, // Check every 15s
  });
}
