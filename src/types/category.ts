export interface Category {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
  parentId?: number | string | null;
  parentName?: string | null;
  isActive: boolean;
  image?: string | null;
  productCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CategoryFormData {
  name: string;
  slug?: string;
  description?: string;
  parentId?: number | string | null;
  isActive: boolean;
  image?: string | null;
}
