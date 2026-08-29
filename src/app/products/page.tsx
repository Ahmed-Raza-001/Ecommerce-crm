"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useProducts } from "@/hooks/useProductsQuery";
import { useCategories } from "@/hooks/useCategoriesQuery";
import { ProductFilterParams } from "@/types/product";
import { ProductFilterBar } from "@/components/products/ProductFilterBar";
import { ProductTable } from "@/components/products/ProductTable";
import { ProductGrid } from "@/components/products/ProductGrid";
import { BulkActionBar } from "@/components/products/BulkActionBar";
import { ProductDetailDrawer } from "@/components/products/ProductDetailDrawer";
import { Plus, Package, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get("search") || "";

  const [filters, setFilters] = useState<ProductFilterParams>({
    search: initialSearch,
    categoryId: undefined,
    status: "all",
    stockFilter: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const { data: products, isLoading, refetch, isFetching } = useProducts(filters);
  const { data: categories = [] } = useCategories();

  console.log(products,"product 1")
  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Header with Title and Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <Package className="h-7 w-7 text-primary" /> Product Catalog CRM
            </h1>
            <Badge variant="secondary" className="font-bold">
              {products?.length ?? 0} Items
            </Badge>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Search, filter, update stock inline, and manage your e-commerce repository.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />}
          >
            Refresh
          </Button>
          <Link href="/products/new">
            <Button variant="glow" leftIcon={<Plus className="h-4 w-4" />}>
              Add Product
            </Button>
          </Link>
        </div>
      </div>
      <ProductFilterBar
        filters={filters}
        onFilterChange={setFilters}
        categories={categories}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      ) : viewMode === "table" ? (
        <ProductTable products={products || []} />
      ) : (
        <ProductGrid products={products || []} />
      )}
      <BulkActionBar products={products || []} />
      <ProductDetailDrawer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}
