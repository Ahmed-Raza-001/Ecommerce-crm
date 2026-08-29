import { create } from "zustand";
import { User } from "@/types/api";
import { apiClient } from "@/lib/api-client";

interface ExtendedAuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  loginWithCredentials: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

const getInitialToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ecommerce_crm_token");
};

const getInitialUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("ecommerce_crm_user");
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

const initialToken = getInitialToken();
const initialUser = getInitialUser();

export const useAuthStore = create<ExtendedAuthState & AuthActions>((set, get) => ({
  user: initialUser,
  token: initialToken,
  isAuthenticated: !!initialToken,
  isLoading: false,
  error: null,

  loginWithCredentials: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await apiClient.login(email, password);
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to log in. Please check your credentials.";
      set({
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false,
      });
      return false;
    }
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ecommerce_crm_user");
      localStorage.removeItem("ecommerce_crm_token");
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  setToken: (token: string | null) => {
    if (typeof window !== "undefined") {
      if (token) localStorage.setItem("ecommerce_crm_token", token);
      else localStorage.removeItem("ecommerce_crm_token");
    }
    set({ token, isAuthenticated: !!token });
  },

  setUser: (user: User | null) => {
    if (typeof window !== "undefined") {
      if (user) localStorage.setItem("ecommerce_crm_user", JSON.stringify(user));
      else localStorage.removeItem("ecommerce_crm_user");
    }
    set({ user });
  },

  checkAuth: async () => {
    const token = getInitialToken();
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false });
      return;
    }

    try {
      const user = await apiClient.getCurrentUser();
      if (user) {
        set({ user, token, isAuthenticated: true });
      } else {
        // Token invalid or expired
        get().logout();
      }
    } catch {
      // Keep existing stored state on offline/network errors
    }
  },

  clearError: () => set({ error: null }),
}));
