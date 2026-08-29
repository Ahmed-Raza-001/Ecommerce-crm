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
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

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
    tags: raw.tags || ["Imitation Jewellery"],
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
      const hadToken = !!localStorage.getItem("ecommerce_crm_token");
      localStorage.removeItem("ecommerce_crm_token");
      localStorage.removeItem("ecommerce_crm_user");

      if (hadToken && !window.location.pathname.startsWith("/login")) {
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

  private isRefreshingToken = false;
  private refreshPromise: Promise<string | null> | null = null;

  public async refreshJwtToken(): Promise<string | null> {
    if (this.isRefreshingToken && this.refreshPromise) {
      return this.refreshPromise;
    }

    const oldToken = this.getAuthToken();
    if (!oldToken) return null;

    this.isRefreshingToken = true;
    this.refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/token/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: oldToken }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.token) {
            console.log("JWT Token refreshed successfully after expiration.");
            if (typeof window !== "undefined") {
              localStorage.setItem("ecommerce_crm_token", data.token);
            }
            return data.token as string;
          }
        }
      } catch (err) {
        console.warn("Failed to generate new JWT token:", err);
      } finally {
        this.isRefreshingToken = false;
        this.refreshPromise = null;
      }
      return null;
    })();

    return this.refreshPromise;
  }

  public async fetchWithAuth(url: string, init: RequestInit = {}): Promise<Response> {
    const headers = new Headers(init.headers || {});
    const token = this.getAuthToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    let res = await fetch(url, { ...init, headers });

    if (res.status === 401) {
      const cloned = res.clone();
      const errData = await cloned.json().catch(() => ({}));
      
      const isExpired =
        errData.code === 401 ||
        (typeof errData.message === "string" &&
          (errData.message.toLowerCase().includes("expired") ||
           errData.message.toLowerCase().includes("jwt")));

      if (isExpired && token) {
        console.warn("Token expired. Requesting a new JWT token from backend...");
        const newToken = await this.refreshJwtToken();
        if (newToken) {
          console.log("Retrying request with new JWT token...");
          const retryHeaders = new Headers(init.headers || {});
          retryHeaders.set("Authorization", `Bearer ${newToken}`);
          res = await fetch(url, { ...init, headers: retryHeaders });
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
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.message || (res.status === 401 ? "Invalid email or password" : `Authentication failed (${res.status})`);
          throw new Error(errMsg);
        }

        const data = await res.json();
        const token = data.token;
        if (!token) throw new Error("No authentication token returned by server.");

        // Store token in localStorage immediately for subsequent requests
        if (typeof window !== "undefined") {
          localStorage.setItem("ecommerce_crm_token", token);
        }

        // Fetch current user details from /api/me
        let user: User = {
          id: 1,
          email: email,
          name: email.split("@")[0].toUpperCase(),
          role: "admin",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        };

        try {
          const meRes = await fetch(`${API_BASE_URL}/api/me`, {
            headers: this.getAuthHeaders(),
          });
          if (meRes.ok) {
            const meData = await meRes.json();
            user = {
              id: meData.id || 1,
              email: meData.email || email,
              name: (meData.email || email).split("@")[0].toUpperCase(),
              role: meData.roles?.includes("ROLE_ADMIN") ? "admin" : "manager",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
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
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("ecommerce_crm_token", token);
      localStorage.setItem("ecommerce_crm_user", JSON.stringify(user));
    }
    return { token, user };
  }

  async getCurrentUser(): Promise<User | null> {
    const token = this.getAuthToken();
    if (!token) return null;

    if (!this.isDemoMode()) {
      try {
        const res = await this.fetchWithAuth(`${API_BASE_URL}/api/me`, {
          headers: this.getAuthHeaders(),
        });
        if (res.ok) {
          const meData = await res.json();
          const user: User = {
            id: meData.id || 1,
            email: meData.email,
            name: meData.email.split("@")[0].toUpperCase(),
            role: meData.roles?.includes("ROLE_ADMIN") ? "admin" : "manager",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
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
        const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
          headers: {
            "Content-Type": "application/json",
            ...(this.getAuthToken() ? { Authorization: `Bearer ${this.getAuthToken()}` } : {}),
          },
        });
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
          category_id: formData.categoryId ? String(formData.categoryId) : null,
        };

        const res = await fetch(`${API_BASE_URL}/api/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(this.getAuthToken() ? { Authorization: `Bearer ${this.getAuthToken()}` } : {}),
          },
          body: JSON.stringify(symfonyPayload),
        });
        if (res.ok) {
          const raw = await res.json();
          return mapSymfonyProduct(raw);
        } else if (res.status === 401) {
          this.handleUnauthorized();
          throw new Error("401 Unauthorized: Session expired. Please log in again.");
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
        if (data.categoryId !== undefined)
          symfonyPayload.category_id = data.categoryId ? String(data.categoryId) : null;

        const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(this.getAuthToken() ? { Authorization: `Bearer ${this.getAuthToken()}` } : {}),
          },
          body: JSON.stringify(symfonyPayload),
        });
        if (res.ok) {
          const raw = await res.json();
          return mapSymfonyProduct(raw);
        }
      } catch (err) {
        console.warn("Backend updateProduct failed, using local store fallback:", err);
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
        const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
          method: "DELETE",
          headers: {
            ...(this.getAuthToken() ? { Authorization: `Bearer ${this.getAuthToken()}` } : {}),
          },
        });
        if (res.ok) return true;
      } catch (err) {
        console.warn("Backend deleteProduct failed, using local store:", err);
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

        const res = await fetch(`${API_BASE_URL}/api/categories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(this.getAuthToken() ? { Authorization: `Bearer ${this.getAuthToken()}` } : {}),
          },
          body: JSON.stringify(symfonyCategoryPayload),
        });
        if (res.ok) {
          const raw = await res.json();
          return mapSymfonyCategory(raw);
        } else if (res.status === 401) {
          throw new Error("401 Unauthorized: Please login with admin credentials to create categories.");
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

        const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(this.getAuthToken() ? { Authorization: `Bearer ${this.getAuthToken()}` } : {}),
          },
          body: JSON.stringify(symfonyCategoryPayload),
        });
        if (res.ok) {
          const raw = await res.json();
          return mapSymfonyCategory(raw);
        }
      } catch (err) {
        console.warn("Backend updateCategory failed, using local store:", err);
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
        const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
          method: "DELETE",
          headers: {
            ...(this.getAuthToken() ? { Authorization: `Bearer ${this.getAuthToken()}` } : {}),
          },
        });
        if (res.ok) return true;
      } catch (err) {
        console.warn("Backend deleteCategory failed, using local store:", err);
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

        const res = await fetch(`${API_BASE_URL}/api/upload`, {
          method: "POST",
          headers: {
            ...(this.getAuthToken() ? { Authorization: `Bearer ${this.getAuthToken()}` } : {}),
          },
          body: formData,
        });

        if (res.ok) {
          const json = await res.json();
          const uploadUrl = json.data?.url || json.url;
          if (uploadUrl) {
            this.recordUploadedMedia(file.name, uploadUrl, file.size, file.type, folder);
            return { url: uploadUrl, name: file.name, size: file.size };
          }
        } else if (res.status === 401) {
          this.handleUnauthorized();
          throw new Error("Unauthorized: Session expired. Please log in again.");
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
