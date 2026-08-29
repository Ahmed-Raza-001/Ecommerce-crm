import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  globalSearch: string;
  theme: "dark" | "light";
  selectedProductIdForDrawer: number | string | null;
  activeTab: string;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setGlobalSearch: (search: string) => void;
  setTheme: (theme: "dark" | "light") => void;
  toggleTheme: () => void;
  openProductDrawer: (id: number | string) => void;
  closeProductDrawer: () => void;
  setActiveTab: (tab: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  globalSearch: "",
  theme: "light",
  selectedProductIdForDrawer: null,
  activeTab: "overview",

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  setGlobalSearch: (search: string) => set({ globalSearch: search }),
  setTheme: (theme: "dark" | "light") => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      if (theme === "dark") {
        root.classList.remove("light");
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
        root.classList.add("light");
      }
    }
    set({ theme });
  },
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        const root = document.documentElement;
        if (nextTheme === "dark") {
          root.classList.remove("light");
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
          root.classList.add("light");
        }
      }
      return { theme: nextTheme };
    }),
  openProductDrawer: (id: number | string) => set({ selectedProductIdForDrawer: id }),
  closeProductDrawer: () => set({ selectedProductIdForDrawer: null }),
  setActiveTab: (tab: string) => set({ activeTab: tab }),
}));
