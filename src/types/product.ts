import { Category } from "./category";

export type ProductStatus = "active" | "draft" | "out_of_stock";

export interface Product {
  id: number | string;
  title: string;
  name?: string; // Alias for title
  sku: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  status: ProductStatus;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  weight?: string;
  material?: string;
  colour?: string;
  size?: string;
  jewelleryType?: string;
  category?: Category | null;
  categoryId?: number | string | null;
  image?: string | null;
  gallery?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface ProductFormData {
  title: string;
  sku: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  status: ProductStatus;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  weight?: string;
  material?: string;
  colour?: string;
  size?: string;
  jewelleryType?: string;
  categoryId?: number | string | null;
  image?: string | null;
  gallery?: string[];
  tags?: string[];
}

export interface ProductFilterParams {
  search?: string;
  categoryId?: number | string | null;
  status?: string;
  stockFilter?: "all" | "in_stock" | "low_stock" | "out_of_stock";
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "title" | "price" | "stock" | "createdAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
