"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useCategoriesQuery";
import { Category, CategoryFormData } from "@/types/category";
import { CategoryFormModal } from "@/components/categories/CategoryFormModal";
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Package,
  Search,
  ArrowRight,
  FolderCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { Dialog } from "@/components/ui/Dialog";

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase()) ||
    cat.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreate = () => {
    setSelectedCategory(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setSelectedCategory(category);
    setModalOpen(true);
  };

  const handleFormSubmit = async (data: CategoryFormData) => {
    if (selectedCategory) {
      await updateMutation.mutateAsync({
        id: selectedCategory.id,
        data,
      });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleDelete = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete.id, {
        onSuccess: () => setCategoryToDelete(null),
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#111827] flex items-center gap-2">
              <FolderTree className="h-7 w-7 text-[#2563EB]" /> Imitation Jewellery Categories
            </h1>
            <Badge variant="secondary" className="font-bold">
              {categories.length} Categories
            </Badge>
          </div>
          <p className="text-xs md:text-sm text-[#64748B] mt-1">
            Manage jewelry classifications, bridal sets, chokers, jhumkas, and parent-child hierarchies.
          </p>
        </div>

        <Button
          variant="default"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="h-4 w-4" />}
          className="bg-[#2563EB] hover:bg-blue-700 text-white shadow-xs"
        >
          Add Category
        </Button>
      </div>

      {/* Imitation Jewellery Info Banner */}
      <div className="flex items-center gap-3 p-4 rounded-xl border border-blue-200 bg-blue-50/60 text-[#111827]">
        <Sparkles className="h-5 w-5 text-[#2563EB] shrink-0" />
        <p className="text-xs sm:text-sm text-[#111827]">
          <strong>Jewellery Catalog Scope:</strong> All products and subcategories are tailored for <strong>Imitation Jewellery</strong> (Kundan, Temple Antique, Polki, American Diamond, Bangles & Chokers).
        </p>
      </div>

      {/* Search & Filter bar */}
      <div className="flex items-center gap-3">
        <div className="max-w-md w-full">
          <Input
            placeholder="Search jewelry categories by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4 text-[#64748B]" />}
            className="h-10 bg-white border-[#E2E8F0]"
          />
        </div>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 rounded-2xl bg-slate-200" />
          <Skeleton className="h-48 rounded-2xl bg-slate-200" />
          <Skeleton className="h-48 rounded-2xl bg-slate-200" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="flex h-48 w-full items-center justify-center rounded-2xl border border-dashed border-[#E2E8F0] bg-white text-[#64748B]">
          No categories found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => (
            <Card
              key={cat.id}
              className="group overflow-hidden border-[#E2E8F0] bg-white shadow-xs hover:border-[#2563EB]/40 hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Category Header Card */}
              <div>
                <div className="relative h-32 w-full overflow-hidden bg-slate-50">
                  {cat.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-400 bg-slate-100">
                      <FolderCheck className="h-10 w-10" />
                    </div>
                  )}

                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <Badge variant={cat.isActive ? "success" : "secondary"}>
                      {cat.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {cat.parentName && (
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="secondary" className="text-[10px] bg-black/60 text-white backdrop-blur-xs border-0">
                        Parent: {cat.parentName}
                      </Badge>
                    </div>
                  )}
                </div>

                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-[#111827]">
                      {cat.name}
                    </CardTitle>
                    <span className="text-[11px] font-mono text-[#64748B]">
                      /{cat.slug}
                    </span>
                  </div>
                  <CardDescription className="text-xs text-[#64748B] line-clamp-2 mt-1">
                    {cat.description || "No description provided."}
                  </CardDescription>
                </CardHeader>
              </div>

              {/* Card Footer */}
              <CardContent className="p-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                <Link
                  href={`/products?categoryId=${cat.id}`}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:underline"
                >
                  <Package className="h-3.5 w-3.5" />
                  <span>{cat.productCount ?? 0} Products</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEdit(cat)}
                    className="h-8 w-8 text-[#64748B] hover:text-[#2563EB]"
                    title="Edit Category"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCategoryToDelete(cat)}
                    className="h-8 w-8 text-[#64748B] hover:text-[#DC2626]"
                    title="Delete Category"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Category Create/Edit Modal */}
      <CategoryFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        category={selectedCategory}
        categories={categories}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        title="Delete Category"
        description={`Are you sure you want to remove the category "${categoryToDelete?.name}"?`}
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          {categoryToDelete?.productCount && categoryToDelete.productCount > 0 ? (
            <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200 font-medium">
              Warning: There are currently {categoryToDelete.productCount} products assigned to this category.
            </p>
          ) : null}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setCategoryToDelete(null)} className="border-[#E2E8F0]">
              Cancel
            </Button>
            <Button
              variant="destructive"
              isLoading={deleteMutation.isPending}
              onClick={handleDelete}
            >
              Delete Category
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
