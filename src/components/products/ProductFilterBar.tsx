"use client";

import React from "react";
import { ProductFilterParams } from "@/types/product";
import { Category } from "@/types/category";
import { Search, LayoutGrid, List, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export interface ProductFilterBarProps {
  filters: ProductFilterParams;
  onFilterChange: (filters: ProductFilterParams) => void;
  categories: Category[];
  viewMode: "table" | "grid";
  onViewModeChange: (mode: "table" | "grid") => void;
}

export function ProductFilterBar({
  filters,
  onFilterChange,
  categories,
  viewMode,
  onViewModeChange,
}: ProductFilterBarProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onFilterChange({
      ...filters,
      categoryId: val === "all" ? undefined : Number(val),
    });
  };

  const handleStockFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      stockFilter: e.target.value as any,
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split(":") as [any, any];
    onFilterChange({
      ...filters,
      sortBy,
      sortOrder,
    });
  };

  const handleReset = () => {
    onFilterChange({
      search: "",
      categoryId: undefined,
      status: "all",
      stockFilter: "all",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Box */}
        <div className="relative flex-1">
          <Input
            placeholder="Search by title, SKU, description, or tags..."
            value={filters.search || ""}
            onChange={handleSearchChange}
            leftIcon={<Search className="h-4 w-4 text-[#64748B]" />}
            className="h-10 bg-[#F8FAFC]"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Dropdown */}
          <div className="w-40 sm:w-44">
            <Select
              value={filters.categoryId ? String(filters.categoryId) : "all"}
              onChange={handleCategoryChange}
              className="h-10 bg-[#F8FAFC]"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.name} ({cat.productCount ?? 0})
                </option>
              ))}
            </Select>
          </div>

          {/* Stock Status Dropdown */}
          <div className="w-36 sm:w-40">
            <Select
              value={filters.stockFilter || "all"}
              onChange={handleStockFilterChange}
              className="h-10 bg-[#F8FAFC]"
            >
              <option value="all">All Stock Status</option>
              <option value="in_stock">In Stock (&gt;5)</option>
              <option value="low_stock">Low Stock (1-5)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </Select>
          </div>

          {/* Sort By Dropdown */}
          <div className="w-40 sm:w-44">
            <Select
              value={`${filters.sortBy || "createdAt"}:${filters.sortOrder || "desc"}`}
              onChange={handleSortChange}
              className="h-10 bg-[#F8FAFC]"
            >
              <option value="createdAt:desc">Newest Added</option>
              <option value="createdAt:asc">Oldest Added</option>
              <option value="price:asc">Price: Low to High</option>
              <option value="price:desc">Price: High to Low</option>
              <option value="stock:desc">Stock: High to Low</option>
              <option value="stock:asc">Stock: Low to High</option>
              <option value="title:asc">Name: A to Z</option>
            </Select>
          </div>

          {/* Reset Filters */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            title="Reset Filters"
            className="h-10 w-10 text-[#64748B] hover:text-[#111827]"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-[#E2E8F0]">
            <button
              onClick={() => onViewModeChange("table")}
              className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-[#111827] shadow-xs font-semibold"
                  : "text-[#64748B] hover:text-[#111827]"
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange("grid")}
              className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-[#111827] shadow-xs font-semibold"
                  : "text-[#64748B] hover:text-[#111827]"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
