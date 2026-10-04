"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/useUIStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useBackendHealth } from "@/hooks/useDashboardQuery";
import {
  Search,
  Menu,
  Bell,
  Server,
  Sparkles,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";

export function Header() {
  const router = useRouter();
  const { globalSearch, setGlobalSearch, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const { data: health } = useBackendHealth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      router.push(`/products?search=${encodeURIComponent(globalSearch)}`);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-[#E2E8F0] bg-white px-4 md:px-6 shadow-xs">
      {/* Left: Hamburger & Global Quick Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={toggleSidebar}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:text-[#111827] hover:bg-slate-100 transition-all cursor-pointer"
          title="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B] pointer-events-none" />
          <input
            type="text"
            placeholder="Search products, SKUs, categories, tags... (Press Enter)"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-9 pr-4 text-xs text-[#111827] placeholder:text-[#64748B] transition-all focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
          />
        </div>
      </div>

      {/* Center / Right controls */}
      <div className="flex items-center gap-3">
        {/* Backend & Supabase Connection Status Badge */}
        <div className="hidden md:flex items-center">
          {health?.online ? (
            <Badge variant="success" dot className="py-1 px-3 bg-emerald-50 text-emerald-700 border-emerald-200">
              <Server className="h-3.5 w-3.5 mr-1" />
              API Connected ({health.latencyMs}ms)
            </Badge>
          ) : (
            <Badge variant="cyan" dot className="py-1 px-3 text-xs bg-blue-50 text-blue-700 border-blue-200">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Demo Engine & Supabase Active
            </Badge>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            title="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:border-[#2563EB]/40 hover:text-[#111827] hover:bg-white transition-all cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#2563EB] ring-2 ring-white animate-ping" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#2563EB] ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xl z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <span className="text-xs font-bold text-[#111827]">Notifications & Alerts</span>
                <span className="text-[10px] text-[#2563EB] font-semibold cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="space-y-2.5 pt-3">
                <div className="flex items-start gap-2.5 text-xs p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-[#F59E0B] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#111827]">Low Stock Alert</p>
                    <p className="text-[#64748B]">ErgoFlow Mechanical Custom Keyboard has only 3 units left.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-xs p-2.5 rounded-xl bg-slate-50 border border-[#E2E8F0]">
                  <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#111827]">Supabase Storage Synced</p>
                    <p className="text-[#64748B]">Products bucket verified and ready for uploads.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Card & Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 pl-3 py-1 border-l border-[#E2E8F0] hover:opacity-90 transition-all cursor-pointer select-none"
          >
            <div className="h-9 w-9 rounded-xl overflow-hidden border border-[#E2E8F0] bg-slate-100 flex items-center justify-center shrink-0">
              <img
                src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=AdminUser"}
                alt={user?.name || user?.email || "Admin"}
                className="h-full w-full object-cover bg-blue-50"
              />
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-[#111827] truncate max-w-[130px]">
                {user?.name || user?.email || "Admin User"}
              </span>
              <span className="text-[10px] uppercase font-bold text-[#2563EB]">
                {user?.role || "Administrator"}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-[#64748B] hidden lg:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-[#E2E8F0] bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
              <div className="p-3 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-[#111827] truncate">
                  {user?.name || "Authenticated Admin"}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full w-fit">
                  <ShieldCheck className="h-3 w-3" />
                  JWT Session Active
                </div>
              </div>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  router.push("/settings");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
              >
                <UserIcon className="h-4 w-4 text-slate-400" />
                Account & API Settings
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer mt-1"
              >
                <LogOut className="h-4 w-4 text-rose-500" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
