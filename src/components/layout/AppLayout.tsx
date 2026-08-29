"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAuthStore } from "@/store/useAuthStore";
import { Layers, Loader2 } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    // Initial check on mount
    checkAuth().finally(() => {
      setIsHydrated(true);
    });
  }, [checkAuth]);

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated && !isLoginPage) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoginPage, isHydrated, pathname, router]);

  // If on login page, render full screen login without sidebar or header
  if (isLoginPage) {
    return <div className="min-h-screen w-full bg-[#0B0F17] text-white">{children}</div>;
  }

  // Show a clean loading state while hydrating initial auth token check
  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0F17] text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30 animate-pulse">
            <Layers className="h-6 w-6" />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            Initializing Authenticated Workspace...
          </div>
        </div>
      </div>
    );
  }

  // Protected route layout
  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
