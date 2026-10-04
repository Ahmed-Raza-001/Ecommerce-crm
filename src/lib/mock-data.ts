import { Category } from "@/types/category";
import { Product } from "@/types/product";
import { DashboardStats, MediaAsset } from "@/types/api";

export const INITIAL_CATEGORIES: Category[] = [];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_MEDIA_ASSETS: MediaAsset[] = [];

// LocalStorage keys
const STORAGE_KEYS = {
  PRODUCTS: "ecommerce_crm_products_v3",
  CATEGORIES: "ecommerce_crm_categories_v3",
  MEDIA: "ecommerce_crm_media_v3",
};

export function getStoredProducts(): Product[] {
  return [];
}

export function saveStoredProducts(_products: Product[]): void {
  // Products are managed strictly via live API, not stored in localStorage
}

export function getStoredCategories(): Category[] {
  return [];
}

export function saveStoredCategories(_categories: Category[]): void {
  // Categories are managed strictly via live API, not stored in localStorage
}

export function getStoredMedia(): MediaAsset[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MEDIA);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveStoredMedia(media: MediaAsset[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(media));
  } catch (err) {
    console.error("Failed to save media to localStorage", err);
  }
}

export function resetMockData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
  localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
  localStorage.removeItem(STORAGE_KEYS.MEDIA);
  localStorage.removeItem("ecommerce_crm_products_jewellery_v2");
  localStorage.removeItem("ecommerce_crm_categories_jewellery_v2");
  localStorage.removeItem("ecommerce_crm_media_jewellery_v2");
}

export function calculateDashboardStats(products: Product[], categories: Category[]): DashboardStats {
  const totalProducts = products.length;
  const totalStockUnits = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + (Number(p.price) || 0) * (Number(p.stock) || 0),
    0
  );
  const lowStockCount = products.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 5).length;
  const outOfStockCount = products.filter((p) => Number(p.stock) === 0).length;
  const activeCategoriesCount = categories.filter((c) => c.isActive !== false).length;

  const categoryDistribution = categories.map((cat) => {
    const catProducts = products.filter(
      (p) => p.categoryId === cat.id || p.category?.id === cat.id
    );
    const catStock = catProducts.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
    return {
      categoryName: cat.name,
      productCount: catProducts.length,
      totalStock: catStock,
    };
  });

  const recentActivity = products.slice(0, 5).map((p, index) => ({
    id: `act-${p.id || index}`,
    action: "Product Synced",
    target: `${p.title || p.name} ($${p.price})`,
    timestamp: p.createdAt || new Date().toISOString(),
    user: "Symfony API",
  }));

  return {
    totalProducts,
    totalStockUnits,
    totalInventoryValue,
    lowStockCount,
    outOfStockCount,
    activeCategoriesCount,
    categoryDistribution,
    recentActivity,
  };
}
