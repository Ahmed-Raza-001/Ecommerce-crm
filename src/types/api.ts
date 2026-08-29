export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface User {
  id: number | string;
  email: string;
  name: string;
  role: "admin" | "manager" | "viewer";
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface DashboardStats {
  totalProducts: number;
  totalStockUnits: number;
  totalInventoryValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  activeCategoriesCount: number;
  categoryDistribution: {
    categoryName: string;
    productCount: number;
    totalStock: number;
  }[];
  recentActivity: {
    id: string;
    action: string;
    target: string;
    timestamp: string;
    user: string;
  }[];
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string;
  bucket?: string;
}
