"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCategories } from "@/hooks/useCategoriesQuery";
import { useCreateProduct } from "@/hooks/useProductsQuery";
import { ProductForm } from "@/components/products/ProductForm";
import { ProductFormData } from "@/types/product";
import { PlusCircle } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateProduct();

  const handleCreate = async (data: ProductFormData) => {
    await createMutation.mutateAsync(data);
    router.push("/products");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <PlusCircle className="h-7 w-7 text-primary" /> Create New Product
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          Add a brand new item to the store catalog with high-resolution imagery and specifications.
        </p>
      </div>

      <ProductForm
        categories={categories}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
