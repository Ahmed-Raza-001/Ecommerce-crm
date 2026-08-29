"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { useSelectionStore } from "@/store/useSelectionStore";
import { useUIStore } from "@/store/useUIStore";
import { useDeleteProduct } from "@/hooks/useProductsQuery";
import { formatCurrency } from "@/lib/utils";
import { Package, Eye, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const { toggleSelectProduct, isSelected } = useSelectionStore();
  const { openProductDrawer } = useUIStore();
  const deleteMutation = useDeleteProduct();
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  if (products.length === 0) {
    return (
      <div className="flex h-48 w-full items-center justify-center rounded-2xl border border-dashed border-[#E2E8F0] bg-white text-[#64748B]">
        No products found.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {products.map((product) => {
          const selected = isSelected(product.id);
          const isLowStock = product.stock > 0 && product.stock <= 5;
          const isOutOfStock = product.stock === 0;

          return (
            <div
              key={product.id}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-200 bg-white shadow-xs hover:shadow-md hover:-translate-y-0.5 ${
                selected ? "border-[#2563EB] ring-2 ring-[#2563EB]/20" : "border-[#E2E8F0] hover:border-[#2563EB]/40"
              }`}
            >
              {/* Top Media & Selection Overlay */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-50">
                {product.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#64748B]">
                    <Package className="h-8 w-8 opacity-40" />
                  </div>
                )}

                {/* Checkbox trigger in corner */}
                <button
                  onClick={() => toggleSelectProduct(product.id)}
                  className={`absolute top-3 left-3 flex h-7 w-7 items-center justify-center rounded-lg backdrop-blur-md transition-all cursor-pointer ${
                    selected
                      ? "bg-[#2563EB] text-white shadow-sm"
                      : "bg-black/40 text-white/80 hover:bg-black/60"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>

                {/* Stock Tag */}
                <div className="absolute top-3 right-3">
                  {isOutOfStock ? (
                    <Badge variant="destructive" dot>Out of Stock</Badge>
                  ) : isLowStock ? (
                    <Badge variant="warning" dot>{product.stock} Left</Badge>
                  ) : (
                    <Badge variant="success">{product.stock} in stock</Badge>
                  )}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                    <span className="font-mono">{product.sku}</span>
                    <span className="font-semibold text-[#2563EB]">{product.category?.name || "Imitation Jewellery"}</span>
                  </div>

                  <h3
                    onClick={() => openProductDrawer(product.id)}
                    className="font-bold text-sm text-[#111827] line-clamp-1 hover:text-[#2563EB] cursor-pointer transition-colors"
                  >
                    {product.title}
                  </h3>

                  <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                  <div className="flex flex-col">
                    <span className="text-lg font-black text-[#111827]">
                      {formatCurrency(product.price)}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="text-xs text-[#64748B] line-through">
                        {formatCurrency(product.compareAtPrice)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openProductDrawer(product.id)}
                      className="h-8 w-8 text-[#64748B] hover:text-[#2563EB]"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Link href={`/products/${product.id}/edit`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#64748B] hover:text-[#2563EB]"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setProductToDelete(product)}
                      className="h-8 w-8 text-[#64748B] hover:text-[#DC2626]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        title="Delete Product"
        description={`Are you sure you want to remove "${productToDelete?.title}"?`}
        maxWidth="sm"
      >
        <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
          <Button variant="outline" onClick={() => setProductToDelete(null)} className="border-[#E2E8F0]">
            Cancel
          </Button>
          <Button
            variant="destructive"
            isLoading={deleteMutation.isPending}
            onClick={() => {
              if (productToDelete) {
                deleteMutation.mutate(productToDelete.id, {
                  onSuccess: () => setProductToDelete(null),
                });
              }
            }}
          >
            Delete
          </Button>
        </div>
      </Dialog>
    </>
  );
}
