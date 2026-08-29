"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";
import { useDashboardStats } from "@/hooks/useDashboardQuery";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Image as ImageIcon,
  ArrowUpDown,
  Settings2,
  Menu,
  PlusCircle,
  Sparkles,
  Layers,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeVariant?: "default" | "warning" | "destructive";
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { data: stats } = useDashboardStats();

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      label: "Products CRM",
      href: "/products",
      icon: Package,
      badge: stats?.lowStockCount ? `${stats.lowStockCount} alert` : undefined,
      badgeVariant: stats?.lowStockCount ? "warning" : undefined,
    },
    {
      label: "Categories",
      href: "/categories",
      icon: FolderTree,
      badge: stats?.activeCategoriesCount,
    },
    {
      label: "Media Hub",
      href: "/media",
      icon: ImageIcon,
    },
    {
      label: "Import / Export",
      href: "/import-export",
      icon: ArrowUpDown,
    },
    {
      label: "Settings & API",
      href: "/settings",
      icon: Settings2,
    },
  ];

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-[#111827] text-[#F8FAFC] border-r border-[#1F2937] transition-all duration-300 z-30 shrink-0 select-none shadow-xl",
        sidebarOpen ? "w-64" : "w-20"
      )}
    >
      {/* Brand Header with Hamburger Button */}
      <div className="flex h-16 items-center justify-between px-3.5 border-b border-[#1F2937]">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={toggleSidebar}
            title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>

          {sidebarOpen && (
            <Link href="/" className="flex items-center gap-2 truncate">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#2563EB] text-white shadow-md shadow-blue-600/30">
                <Layers className="h-4 w-4" />
              </div>
              <div className="flex flex-col truncate">
                <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1">
                  NEXUS CRM
                </span>
                <span className="text-[10px] text-slate-400 font-medium leading-none">
                  Product & Inventory
                </span>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="p-3">
        {sidebarOpen ? (
          <Link href="/products/new">
            <Button
              className="w-full justify-start text-xs font-semibold bg-[#2563EB] hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
              leftIcon={<PlusCircle className="h-4 w-4" />}
            >
              Add New Product
            </Button>
          </Link>
        ) : (
          <Link href="/products/new">
            <Button
              size="icon"
              className="w-full h-10 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
              title="Add New Product"
            >
              <PlusCircle className="h-5 w-5" />
            </Button>
          </Link>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 px-3 py-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={!sidebarOpen ? item.label : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-[#2563EB] text-white font-semibold shadow-md shadow-blue-600/25"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                )}
              />
              {sidebarOpen && (
                <span className="truncate flex-1">{item.label}</span>
              )}
              {sidebarOpen && item.badge !== undefined && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase",
                    isActive
                      ? "bg-white/20 text-white"
                      : item.badgeVariant === "warning"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-slate-800 text-slate-300"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Inventory Valuation Pill (when expanded) */}
      {sidebarOpen && stats && (
        <div className="p-3 m-3 rounded-xl bg-slate-800/70 border border-[#1F2937] text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Total Units</span>
            <span className="font-semibold text-white">{stats.totalStockUnits}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Inventory Value</span>
            <span className="font-semibold text-emerald-400">
              ${stats.totalInventoryValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}

      {/* Bottom Hamburger / Collapse Bar */}
      <div className="p-3 border-t border-[#1F2937]">
        <button
          onClick={toggleSidebar}
          className="flex h-9 w-full items-center justify-center gap-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
        >
          <Menu className="h-4 w-4" />
          {sidebarOpen && <span>Toggle Sidebar</span>}
        </button>
      </div>
    </aside>
  );
}
