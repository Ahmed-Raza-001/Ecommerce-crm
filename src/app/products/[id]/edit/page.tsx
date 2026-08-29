"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useCategories } from "@/hooks/useCategoriesQuery";
import { useProduct, useUpdateProduct } from "@/hooks/useProductsQuery";
import { ProductForm } from "@/components/products/ProductForm";
import { ProductFormData } from "@/types/product";
import { Edit3, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = (params?.id as string) || "";

  const { data: product, isLoading: productLoading } = useProduct(productId);
  const { data: categories = [] } = useCategories();
  const updateMutation = useUpdateProduct();

  const handleUpdate = async (data: ProductFormData) => {
    await updateMutation.mutateAsync({
      id: productId,
      data,
    });
    router.push("/products");
  };

  if (productLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64 bg-slate-200" />
        <Skeleton className="h-96 w-full rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-2xl border border-[#E2E8F0] bg-white text-center space-y-4 shadow-xs">
        <Package className="h-12 w-12 text-[#64748B] mx-auto" />
        <h2 className="text-xl font-bold text-[#111827]">Product Not Found</h2>
        <p className="text-sm text-[#64748B]">The product requested could not be located in the catalog.</p>
        <button
          onClick={() => router.push("/products")}
          className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-blue-700"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#111827] flex items-center gap-2">
          <Edit3 className="h-7 w-7 text-[#2563EB]" /> Edit Product: {product.title}
        </h1>
        <p className="text-xs md:text-sm text-[#64748B] mt-1">
          Modify pricing, update stock numbers, or upload fresh jewelry photography.
        </p>
      </div>

      <ProductForm
        initialData={product}
        categories={categories}
        onSubmit={handleUpdate}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}
