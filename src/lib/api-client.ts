import { Product, ProductFormData, ProductFilterParams } from "@/types/product";
import { Category, CategoryFormData } from "@/types/category";
import { DashboardStats, MediaAsset, User } from "@/types/api";
import {
  getStoredProducts,
  saveStoredProducts,
  getStoredCategories,
  saveStoredCategories,
  getStoredMedia,
  saveStoredMedia,
  calculateDashboardStats,
} from "./mock-data";
import { uploadImageToSupabase } from "./supabase";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000" ;

function mapSymfonyProduct(raw: any): Product {
  return {
    id: raw.id,
    title: raw.name || raw.title || "Untitled Product",
    name: raw.name || raw.title,
    sku: raw.sku || `JWL-${String(raw.id).replace(/[^a-zA-Z0-9]/g, "").substring(0, 6).toUpperCase()}`,
    description: raw.description || "",
    price: typeof raw.price === "string" ? parseFloat(raw.price) : Number(raw.price || 0),
    compareAtPrice: raw.compareAtPrice ? Number(raw.compareAtPrice) : undefined,
    costPrice: raw.costPrice ? Number(raw.costPrice) : undefined,
    stock: Number(raw.stock) || 0,
    status: raw.status || "active",
    isNewArrival: Boolean(raw.isNewArrival ?? raw.is_new_arrival),
    isBestSeller: Boolean(raw.isBestSeller ?? raw.is_best_seller),
    weight: raw.weight || undefined,
    material: raw.material || undefined,
    colour: raw.colour || raw.color || undefined,
    size: raw.size || undefined,
    jewelleryType: raw.jewelleryType || raw.jewellery_type || undefined,
    category: raw.category
      ? {
          id: raw.category.id,
          name: raw.category.name,
          slug: raw.category.slug || "",
          isActive: true,
          createdAt: raw.createdAt || new Date().toISOString(),
        }
      : null,
    categoryId: raw.category?.id || raw.category_id || raw.categoryId || null,
    image: raw.image || null,
    gallery: raw.gallery || (raw.image ? [raw.image] : []),
    tags: Array.isArray(raw.tags) && raw.tags.length > 0 ? raw.tags : ["Imitation Jewellery"],
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt,
  };
}

function mapSymfonyCategory(raw: any): Category {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug || raw.name.toLowerCase().replace(/\s+/g, "-"),
    description: raw.description || "",
    image: raw.image || null,
    isActive:
      raw.status !== undefined
        ? raw.status === "active"
        : raw.isActive !== undefined
        ? raw.isActive
        : true,
    parentId: raw.parent?.id || raw.parent_id || raw.parentId || null,
    parentName: raw.parent?.name || raw.parentName || null,
    productCount: raw.productCount || 0,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt,
  };
}

class ApiClient {
  private isDemoMode(): boolean {
    if (typeof window === "undefined") return false;
    const preference = localStorage.getItem("ecommerce_crm_mode");
    if (preference === "demo") return true;
    if (preference === "live") return false;
    return process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK === "true";
  }

  public getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("ecommerce_crm_token");
  }

  public handleUnauthorized() {
    if (typeof window !== "undefined") {
      const hadUser = !!localStorage.getItem("ecommerce_crm_user");
      localStorage.removeItem("ecommerce_crm_token");
      localStorage.removeItem("ecommerce_crm_user");

      if (hadUser && !window.location.pathname.startsWith("/login")) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
    }
  }

  public getAuthHeaders(includeContentType = true): HeadersInit {
    const headers: Record<string, string> = {};
    if (includeContentType) {
      headers["Content-Type"] = "application/json";
    }
    const token = this.getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  public async fetchWithAuth(url: string, init: RequestInit = {}): Promise<Response> {
    const headers = new Headers(init.headers || {});
    if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const token = this.getAuthToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    let requestUrl = url;
    if (token && token !== "session_cookie_active") {
      try {
        const parsedUrl = new URL(url, typeof window !== "undefined" ? window.location.origin : API_BASE_URL);
        if (!parsedUrl.searchParams.has("token")) {
          parsedUrl.searchParams.set("token", token);
          requestUrl = parsedUrl.toString();
        }
      } catch (err) {
        console.warn("Failed to append token query param:", err);
      }
    }

    let res = await fetch(requestUrl, {
      ...init,
      headers,
      credentials: "include",
    });

    if (res.status === 401) {
      const cloned = res.clone();
      const errData = await cloned.json().catch(() => ({}));

      const isExpired =
        errData.code === 401 ||
        (typeof errData.message === "string" &&
          (errData.message.toLowerCase().includes("expired") ||
           errData.message.toLowerCase().includes("jwt")));

      if (isExpired) {
        console.warn("Session token expired. Attempting token refresh...");
        const refreshRes = await fetch(`${API_BASE_URL}/api/token/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
          body: JSON.stringify({ token: token || "" }),
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          if (refreshData.token) {
            localStorage.setItem("ecommerce_crm_token", refreshData.token);
            headers.set("Authorization", `Bearer ${refreshData.token}`);
          }
          console.log("Retrying request after token refresh...");
          res = await fetch(url, {
            ...init,
            headers,
            credentials: "include",
          });
          return res;
        }
      }

      this.handleUnauthorized();
    }

    return res;
  }

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    if (!this.isDemoMode()) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.message || (res.status === 401 ? "Invalid email or password" : `Authentication failed (${res.status})`);
          throw new Error(errMsg);
        }

        const data = await res.json();
        const token = data.token || "session_cookie_active";

        if (typeof window !== "undefined" && data.token) {
          localStorage.setItem("ecommerce_crm_token", data.token);
        }

        // Fetch current user details from /api/me
        let user: User = {
          id: 1,
          email: email,
          name: email.split("@")[0].toUpperCase(),
          role: "admin",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AdminUser",
        };

        try {
          const meRes = await this.fetchWithAuth(`${API_BASE_URL}/api/me`);
          if (meRes.ok) {
            const meData = await meRes.json();
            user = {
              id: meData.id || 1,
              email: meData.email || email,
              name: (meData.email || email).split("@")[0].toUpperCase(),
              role: meData.roles?.includes("ROLE_ADMIN") ? "admin" : "manager",
              avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AdminUser",
            };
          }
        } catch (meErr) {
          console.warn("Failed to fetch /api/me details:", meErr);
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("ecommerce_crm_user", JSON.stringify(user));
        }

        return { token, user };
      } catch (err: any) {
        console.warn("Backend login request failed:", err);
        throw err;
      }
    }

    // Demo Mode fallback login
    const token = `demo_token_${Date.now()}`;
    const user: User = {
      id: Date.now(),
      email: email,
      name: email.split("@")[0].toUpperCase(),
      role: "admin",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AdminUser",
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("ecommerce_crm_token", token);
      localStorage.setItem("ecommerce_crm_user", JSON.stringify(user));
    }
    return { token, user };
  }

  async getCurrentUser(): Promise<User | null> {
    const token = this.getAuthToken();
    if (!token && typeof window !== "undefined" && !localStorage.getItem("ecommerce_crm_user")) {
      return null;
    }

    if (!this.isDemoMode()) {
      try {
        const res = await this.fetchWithAuth(`${API_BASE_URL}/api/me`);
        if (res.ok) {
          const meData = await res.json();
          const user: User = {
            id: meData.id || 1,
            email: meData.email,
            name: meData.email.split("@")[0].toUpperCase(),
            role: meData.roles?.includes("ROLE_ADMIN") ? "admin" : "manager",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AdminUser",
          };
          if (typeof window !== "undefined") {
            localStorage.setItem("ecommerce_crm_user", JSON.stringify(user));
          }
          return user;
        }
      } catch (err) {
        console.warn("getCurrentUser failed:", err);
      }
    }

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ecommerce_crm_user");
      if (stored) return JSON.parse(stored);
    }
    return null;
  }

  public async checkBackendHealth(): Promise<{
    online: boolean;
    latencyMs: number;
    url: string;
  }> {
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_BASE_URL}/api/categories`, {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return {
        online: res.ok || res.status === 401 || res.status === 404,
        latencyMs: Date.now() - startTime,
        url: API_BASE_URL,
      };
    } catch {
      return {
        online: false,
        latencyMs: Date.now() - startTime,
        url: API_BASE_URL,
      };
    }
  }

  // --- PRODUCTS ---

  async getProducts(params?: ProductFilterParams): Promise<Product[]> {
    if (!this.isDemoMode()) {
      try {
        const res = await this.fetchWithAuth(`${API_BASE_URL}/api/products`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json) ? json : json.data || [];
          let mapped = list.map(mapSymfonyProduct);

          if (params?.search) {
            const q = params.search.toLowerCase().trim();
            mapped = mapped.filter(
              (p: Product) =>
                p.title.toLowerCase().includes(q) ||
                p.sku.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q)
            );
          }
          if (params?.categoryId) {
            mapped = mapped.filter(
              (p: Product) => p.categoryId === params.categoryId || p.category?.id === params.categoryId
            );
          }
          return mapped;
        }
      } catch (err) {
        console.warn("Live API fetch failed, switching to local store fallback:", err);
      }
    }

    // Local / Demo implementation with complete filtering & sorting
    let products = getStoredProducts();
    const categories = getStoredCategories();

    // Map category details
    products = products.map((p) => {
      const cat = categories.find((c) => c.id === p.categoryId) || p.category;
      return { ...p, category: cat || null };
    });

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (params?.categoryId) {
      products = products.filter(
        (p) => p.categoryId === params.categoryId || p.category?.id === params.categoryId
      );
    }

    if (params?.status && params.status !== "all") {
      products = products.filter((p) => p.status === params.status);
    }

    if (params?.stockFilter && params.stockFilter !== "all") {
      if (params.stockFilter === "in_stock") {
        products = products.filter((p) => Number(p.stock) > 5);
      } else if (params.stockFilter === "low_stock") {
        products = products.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 5);
      } else if (params.stockFilter === "out_of_stock") {
        products = products.filter((p) => Number(p.stock) === 0);
      }
    }

    if (params?.minPrice !== undefined) {
      products = products.filter((p) => Number(p.price) >= (params.minPrice || 0));
    }
    if (params?.maxPrice !== undefined && params.maxPrice > 0) {
      products = products.filter((p) => Number(p.price) <= (params.maxPrice || 0));
    }

    if (params?.sortBy) {
      const order = params.sortOrder === "desc" ? -1 : 1;
      products.sort((a, b) => {
        if (params.sortBy === "price") return (Number(a.price) - Number(b.price)) * order;
        if (params.sortBy === "stock") return (Number(a.stock) - Number(b.stock)) * order;
        if (params.sortBy === "title") return a.title.localeCompare(b.title) * order;
        if (params.sortBy === "createdAt")
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * order;
        return 0;
      });
    } else {
      products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return products;
  }

  async getProduct(id: number | string): Promise<Product | null> {
    if (!this.isDemoMode()) {
      try {
        const res = await this.fetchWithAuth(`${API_BASE_URL}/api/products/${id}`);
        if (res.ok) {
          const raw = await res.json();
          return mapSymfonyProduct(raw);
        }
      } catch (err) {
        console.warn("Backend getProduct failed, falling back to local store:", err);
      }
    }

    const products = await this.getProducts();
    return products.find((p) => String(p.id) === String(id)) || null;
  }

  async createProduct(formData: ProductFormData): Promise<Product> {
    if (!this.isDemoMode()) {
      try {
        const symfonyPayload = {
          name: formData.title,
          description: formData.description,
          price: formData.price,
          stock: formData.stock,
          image: formData.image,
          status: formData.status || "active",
          is_new_arrival: formData.isNewArrival || false,
          is_best_seller: formData.isBestSeller || false,
          tags: formData.tags || [],
          weight: formData.weight || null,
          material: formData.material || null,
          colour: formData.colour || null,
          size: formData.size || null,
          jewellery_type: formData.jewelleryType || null,
          category_id: formData.categoryId ? String(formData.categoryId) : null,
        };

        const res = await this.fetchWithAuth(`${API_BASE_URL}/api/products`, {
          method: "POST",
          body: JSON.stringify(symfonyPayload),
        });
        if (res.ok) {
          const raw = await res.json();
          return mapSymfonyProduct(raw);
        } else {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Server Error (${res.status}): PostgreSQL connection or backend error.`);
        }
      } catch (err: any) {
        console.error("Backend createProduct failed:", err);
        throw err;
      }
    }

    const products = getStoredProducts();
    const categories = getStoredCategories();
    const matchedCategory = categories.find((c) => c.id === formData.categoryId) || null;

    const newId = products.length > 0 ? Math.max(...products.map((p) => Number(p.id) || 0)) + 1 : 1;
    const newProduct: Product = {
      ...formData,
      id: newId,
      category: matchedCategory,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    products.unshift(newProduct);
    saveStoredProducts(products);
    return newProduct;
  }

  async updateProduct(id: number | string, data: Partial<ProductFormData>): Promise<Product> {
    if (!this.isDemoMode()) {
      try {
        const symfonyPayload: any = {};
        if (data.title !== undefined) symfonyPayload.name = data.title;
        if (data.description !== undefined) symfonyPayload.description = data.description;
        if (data.price !== undefined) symfonyPayload.price = data.price;
        if (data.stock !== undefined) symfonyPayload.stock = data.stock;
        if (data.image !== undefined) symfonyPayload.image = data.image;
        if (data.status !== undefined) symfonyPayload.status = data.status;
        if (data.isNewArrival !== undefined) symfonyPayload.is_new_arrival = data.isNewArrival;
        if (data.isBestSeller !== undefined) symfonyPayload.is_best_seller = data.isBestSeller;
        if (data.tags !== undefined) symfonyPayload.tags = data.tags;
        if (data.weight !== undefined) symfonyPayload.weight = data.weight;
        if (data.material !== undefined) symfonyPayload.material = data.material;
        if (data.colour !== undefined) symfonyPayload.colour = data.colour;
        if (data.size !== undefined) symfonyPayload.size = data.size;
        if (data.jewelleryType !== undefined) symfonyPayload.jewellery_type = data.jewelleryType;
        if (data.categoryId !== undefined)
          symfonyPayload.category_id = data.categoryId ? String(data.categoryId) : null;

        const res = await this.fetchWithAuth(`${API_BASE_URL}/api/products/${id}`, {
          method: "PUT",
          body: JSON.stringify(symfonyPayload),
        });
        if (res.ok) {
          const raw = await res.json();
          return mapSymfonyProduct(raw);
        } else {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Update failed: Product #${id} server error (${res.status}).`);
        }
      } catch (err: any) {
        console.error("Backend updateProduct failed:", err);
        throw err;
      }
    }

    const products = getStoredProducts();
    const index = products.findIndex((p) => String(p.id) === String(id));
    if (index === -1) throw new Error(`Product #${id} not found`);

    const categories = getStoredCategories();
    const categoryId = data.categoryId !== undefined ? data.categoryId : products[index].categoryId;
    const matchedCategory = categories.find((c) => c.id === categoryId) || products[index].category;

    const updated: Product = {
      ...products[index],
      ...data,
      categoryId,
      category: matchedCategory,
      updatedAt: new Date().toISOString(),
    };

    products[index] = updated;
    saveStoredProducts(products);
    return updated;
  }

  async deleteProduct(id: number | string): Promise<boolean> {
    if (!this.isDemoMode()) {
      try {
        const res = await this.fetchWithAuth(`${API_BASE_URL}/api/products/${id}`, {
          method: "DELETE",
        });
        if (res.ok) return true;
      } catch (err) {
        console.warn("Backend deleteProduct failed:", err);
      }
    }

    const products = getStoredProducts();
    const filtered = products.filter((p) => String(p.id) !== String(id));
    saveStoredProducts(filtered);
    return true;
  }

  async bulkDeleteProducts(ids: (number | string)[]): Promise<boolean> {
    const products = getStoredProducts();
    const idSet = new Set(ids.map(String));
    const filtered = products.filter((p) => !idSet.has(String(p.id)));
    saveStoredProducts(filtered);
    return true;
  }

  async bulkUpdateStock(updates: { id: number | string; stock: number }[]): Promise<boolean> {
    const products = getStoredProducts();
    const updateMap = new Map(updates.map((u) => [String(u.id), u.stock]));
    const updated = products.map((p) => {
      if (updateMap.has(String(p.id))) {
        return { ...p, stock: updateMap.get(String(p.id))!, updatedAt: new Date().toISOString() };
      }
      return p;
    });
    saveStoredProducts(updated);
    return true;
  }

  // --- CATEGORIES ---

  async getCategories(): Promise<Category[]> {
    if (!this.isDemoMode()) {
      try {
        const res = await this.fetchWithAuth(`${API_BASE_URL}/api/categories`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json) ? json : json.data || [];
          return list.map(mapSymfonyCategory);
        }
      } catch (err) {
        console.warn("Backend getCategories failed, falling back to local store:", err);
      }
    }

    const categories = getStoredCategories();
    const products = getStoredProducts();

    return categories.map((cat) => {
      const count = products.filter(
        (p) => String(p.categoryId) === String(cat.id) || String(p.category?.id) === String(cat.id)
      ).length;
      const parent = categories.find((c) => String(c.id) === String(cat.parentId));
      return {
        ...cat,
        productCount: count,
        parentName: parent ? parent.name : null,
      };
    });
  }

  async createCategory(formData: CategoryFormData): Promise<Category> {
    if (!this.isDemoMode()) {
      try {
        const symfonyCategoryPayload = {
          name: formData.name,
          description: formData.description,
          image: formData.image,
          status: formData.isActive ? "active" : "inactive",
          parent_id: formData.parentId ? String(formData.parentId) : null,
        };

        const res = await this.fetchWithAuth(`${API_BASE_URL}/api/categories`, {
          method: "POST",
          body: JSON.stringify(symfonyCategoryPayload),
        });
        if (res.ok) {
          const raw = await res.json();
          return mapSymfonyCategory(raw);
        } else {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Server Error (${res.status}): PostgreSQL connection or backend error.`);
        }
      } catch (err: any) {
        console.error("Backend createCategory failed:", err);
        throw err;
      }
    }

    const categories = getStoredCategories();
    const newId = categories.length > 0 ? Math.max(...categories.map((c) => Number(c.id) || 0)) + 1 : 1;
    const parent = categories.find((c) => String(c.id) === String(formData.parentId));

    const newCategory: Category = {
      ...formData,
      id: newId,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
      parentName: parent ? parent.name : null,
      productCount: 0,
      createdAt: new Date().toISOString(),
    };

    categories.push(newCategory);
    saveStoredCategories(categories);
    return newCategory;
  }

  async updateCategory(id: number | string, data: Partial<CategoryFormData>): Promise<Category> {
    if (!this.isDemoMode()) {
      try {
        const symfonyCategoryPayload: any = {};
        if (data.name !== undefined) symfonyCategoryPayload.name = data.name;
        if (data.description !== undefined) symfonyCategoryPayload.description = data.description;
        if (data.image !== undefined) symfonyCategoryPayload.image = data.image;
        if (data.isActive !== undefined)
          symfonyCategoryPayload.status = data.isActive ? "active" : "inactive";
        if (data.parentId !== undefined)
          symfonyCategoryPayload.parent_id = data.parentId ? String(data.parentId) : null;

        const res = await this.fetchWithAuth(`${API_BASE_URL}/api/categories/${id}`, {
          method: "PUT",
          body: JSON.stringify(symfonyCategoryPayload),
        });
        if (res.ok) {
          const raw = await res.json();
          return mapSymfonyCategory(raw);
        }
      } catch (err) {
        console.warn("Backend updateCategory failed:", err);
      }
    }

    const categories = getStoredCategories();
    const index = categories.findIndex((c) => String(c.id) === String(id));
    if (index === -1) throw new Error(`Category #${id} not found`);

    const parent = data.parentId ? categories.find((c) => String(c.id) === String(data.parentId)) : null;
    const updated: Category = {
      ...categories[index],
      ...data,
      parentName: parent ? parent.name : data.parentId === null ? null : categories[index].parentName,
      updatedAt: new Date().toISOString(),
    };

    categories[index] = updated;
    saveStoredCategories(categories);
    return updated;
  }

  async deleteCategory(id: number | string): Promise<boolean> {
    if (!this.isDemoMode()) {
      try {
        const res = await this.fetchWithAuth(`${API_BASE_URL}/api/categories/${id}`, {
          method: "DELETE",
        });
        if (res.ok) return true;
      } catch (err) {
        console.warn("Backend deleteCategory failed:", err);
      }
    }

    const categories = getStoredCategories();
    const filtered = categories.filter((c) => String(c.id) !== String(id));
    saveStoredCategories(filtered);
    return true;
  }

  // --- DASHBOARD METRICS ---

  async getDashboardStats(): Promise<DashboardStats> {
    const products = await this.getProducts();
    const categories = await this.getCategories();
    return calculateDashboardStats(products, categories);
  }

  // --- MEDIA ASSETS ---

  async getMediaAssets(): Promise<MediaAsset[]> {
    return getStoredMedia();
  }

  async deleteMediaAsset(id: string): Promise<boolean> {
    const media = getStoredMedia();
    const filtered = media.filter((m) => m.id !== id);
    saveStoredMedia(filtered);
    return true;
  }

  // --- FILE & IMAGE UPLOAD PIPELINE ---

  async uploadFile(
    file: File,
    folder: string = "products"
  ): Promise<{ url: string; name: string; size: number }> {
    // 1. Try Symfony Backend endpoint if online
    if (!this.isDemoMode()) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const res = await this.fetchWithAuth(`${API_BASE_URL}/api/upload`, {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const json = await res.json();
          const rawUrl = json.data?.url || json.url;
          if (rawUrl) {
            const uploadUrl = rawUrl.startsWith("http") ? rawUrl : `${API_BASE_URL}${rawUrl}`;
            this.recordUploadedMedia(file.name, uploadUrl, file.size, file.type, folder);
            return { url: uploadUrl, name: file.name, size: file.size };
          }
        } else {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error || json.message || `Upload failed with status ${res.status}`);
        }
      } catch (err: any) {
        console.error("Upload error:", err);
        throw err;
      }
    }

    // 2. Try Supabase direct upload
    const { url, error } = await uploadImageToSupabase(file, folder);
    if (error || !url) {
      throw error || new Error("Supabase direct upload failed.");
    }

    this.recordUploadedMedia(file.name, url, file.size, file.type, folder);
    return {
      url,
      name: file.name,
      size: file.size,
    };
  }

  private recordUploadedMedia(
    name: string,
    url: string,
    size: number,
    mimeType: string,
    bucket: string
  ) {
    const media = getStoredMedia();
    const newAsset: MediaAsset = {
      id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name,
      url,
      size,
      mimeType: mimeType || "image/jpeg",
      createdAt: new Date().toISOString(),
      bucket,
    };
    media.unshift(newAsset);
    saveStoredMedia(media);
  }
}

export const apiClient = new ApiClient();
