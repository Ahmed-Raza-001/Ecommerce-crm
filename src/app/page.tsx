"use client";

import React from "react";
import Link from "next/link";
import { useDashboardStats } from "@/hooks/useDashboardQuery";
import { useProducts } from "@/hooks/useProductsQuery";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Package,
  Boxes,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FolderTree,
  Plus,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: products, isLoading: productsLoading } = useProducts({ limit: 5 });

  const recentProducts = products ? products.slice(0, 5) : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white p-6 md:p-8 shadow-xs">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-50 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="py-0.5 px-2.5">
                <Sparkles className="h-3 w-3 mr-1" />
                Store Performance Hub
              </Badge>
              <span className="text-xs text-[#64748B]">
                Updated in real-time
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#111827]">
              Product & Inventory Command Center
            </h1>
            <p className="text-sm text-[#64748B] max-w-2xl">
              Monitor catalog health, track stock velocities, manage category hierarchies, and synchronize assets seamlessly with Supabase Storage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/products/new">
              <Button leftIcon={<Plus className="h-4 w-4" />}>
                New Product
              </Button>
            </Link>
            <Link href="/categories">
              <Button variant="outline" leftIcon={<FolderTree className="h-4 w-4" />}>
                Categories
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Total Products */}
        <Card className="relative overflow-hidden border-[#E2E8F0] hover:border-[#2563EB]/40 transition-all">
          <div className="absolute right-4 top-4 rounded-xl bg-blue-50 p-2.5 text-[#2563EB]">
            <Package className="h-5 w-5" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Total Products
            </CardDescription>
            {statsLoading ? (
              <Skeleton className="h-9 w-24" />
            ) : (
              <CardTitle className="text-3xl font-black text-[#111827]">
                {stats?.totalProducts ?? 0}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <Badge variant="secondary" className="text-[10px] py-0 px-2 font-normal">
                {stats?.activeCategoriesCount ?? 0} Active Categories
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Inventory Valuation */}
        <Card className="relative overflow-hidden border-[#E2E8F0] hover:border-emerald-500/40 transition-all">
          <div className="absolute right-4 top-4 rounded-xl bg-emerald-50 p-2.5 text-[#16A34A]">
            <DollarSign className="h-5 w-5" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Catalog Valuation
            </CardDescription>
            {statsLoading ? (
              <Skeleton className="h-9 w-32" />
            ) : (
              <CardTitle className="text-3xl font-black text-[#16A34A]">
                {formatCurrency(stats?.totalInventoryValue ?? 0)}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 text-xs text-[#16A34A] font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Asset valuation calculated at retail</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Stock Units */}
        {/* <Card className="relative overflow-hidden border-[#E2E8F0] hover:border-blue-500/40 transition-all">
          <div className="absolute right-4 top-4 rounded-xl bg-blue-50 p-2.5 text-[#2563EB]">
            <Boxes className="h-5 w-5" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Available Units
            </CardDescription>
            {statsLoading ? (
              <Skeleton className="h-9 w-24" />
            ) : (
              <CardTitle className="text-3xl font-black text-[#111827]">
                {stats?.totalStockUnits ?? 0}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <span>Avg per product: </span>
              <span className="font-semibold text-[#111827]">
                {stats?.totalProducts ? Math.round(stats.totalStockUnits / stats.totalProducts) : 0} units
              </span>
            </div>
          </CardContent>
        </Card> */}
        {/* KPI 4: Low Stock Alerts */}
        {/* <Card className="relative overflow-hidden border-[#E2E8F0] hover:border-amber-500/40 transition-all">
          <div className="absolute right-4 top-4 rounded-xl bg-amber-50 p-2.5 text-[#F59E0B]">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Stock Warnings
            </CardDescription>
            {statsLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <CardTitle className="text-3xl font-black text-[#F59E0B]">
                {(stats?.lowStockCount ?? 0) + (stats?.outOfStockCount ?? 0)}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#D97706] font-medium">{stats?.lowStockCount ?? 0} low stock</span>
              <span className="text-[#DC2626] font-medium">{stats?.outOfStockCount ?? 0} out of stock</span>
            </div>
          </CardContent>
        </Card> */}
      </div>

    

      {/* Recent Products Overview Table */}
      <Card className="border-[#E2E8F0]">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-[#111827]">
              <Package className="h-4 w-4 text-[#2563EB]" />
              Recent Product Catalog Entries
            </CardTitle>
            <CardDescription className="text-[#64748B]">Latest items synced in the CRM repository</CardDescription>
          </div>
          <Link href="/products">
            <Button variant="secondary" size="sm" rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}>
              Open Product CRM
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentProducts.map((product) => {
                  const isLowStock = product.stock > 0 && product.stock <= 5;
                  const isOutOfStock = product.stock === 0;

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl overflow-hidden border border-[#E2E8F0] bg-slate-50 shrink-0">
                            {product.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.image}
                                alt={product.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-[#64748B]">
                                <Package className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#111827] hover:text-[#2563EB] transition-colors cursor-pointer">
                              {product.title}
                            </span>
                            <span className="text-xs text-[#64748B] line-clamp-1">
                              {product.description}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-[#64748B] font-semibold">
                        {product.sku}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {product.category?.name || "Unassigned"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-[#111827]">
                        {formatCurrency(product.price)}
                      </TableCell>
                      <TableCell>
                        {isOutOfStock ? (
                          <Badge variant="destructive" dot>0 Out of Stock</Badge>
                        ) : isLowStock ? (
                          <Badge variant="warning" dot>{product.stock} Low Stock</Badge>
                        ) : (
                          <Badge variant="success">{product.stock} in stock</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            product.status === "active"
                              ? "success"
                              : product.status === "draft"
                              ? "warning"
                              : "secondary"
                          }
                        >
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/products`}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
