"use client";

import React from "react";
import Link from "next/link";
import { useUIStore } from "@/store/useUIStore";
import { useProduct, useDeleteProduct } from "@/hooks/useProductsQuery";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  Package,
  Edit2,
  Trash2,
  Copy,
  Tag,
} from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";

export function ProductDetailDrawer() {
  const { selectedProductIdForDrawer, closeProductDrawer } = useUIStore();
  const { data: product, isLoading } = useProduct(selectedProductIdForDrawer);
  const deleteMutation = useDeleteProduct();

  const handleCopyLink = () => {
    if (product?.image) {
      navigator.clipboard.writeText(product.image);
      toast.success("Image URL copied to clipboard");
    }
  };

  return (
    <Sheet
      isOpen={!!selectedProductIdForDrawer}
      onClose={closeProductDrawer}
      title={product?.title || "Product Specifications"}
      description={product ? `SKU: ${product.sku}` : "Loading product details..."}
      size="lg"
    >
      {isLoading ? (
        <div className="space-y-6 pt-4">
          <Skeleton className="h-64 w-full rounded-2xl bg-slate-200" />
          <Skeleton className="h-10 w-3/4 bg-slate-200" />
          <Skeleton className="h-20 w-full bg-slate-200" />
        </div>
      ) : product ? (
        <div className="space-y-6 pt-2 pb-12">
          {/* Main Hero Image */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-[#E2E8F0] bg-slate-50">
            {product.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[#64748B]">
                <Package className="h-12 w-12 opacity-40" />
              </div>
            )}

            {product.image && (
              <button
                onClick={handleCopyLink}
                className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-xl bg-black/70 px-3 py-1.5 text-xs text-white backdrop-blur-md hover:bg-black/90 transition-colors cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy Image URL
              </button>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] text-center shadow-2xs">
              <span className="text-[11px] text-[#64748B] uppercase font-bold">Price</span>
              <p className="text-lg font-black text-[#111827] mt-1">
                {formatCurrency(product.price)}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] text-center shadow-2xs">
              <span className="text-[11px] text-[#64748B] uppercase font-bold">Stock</span>
              <p className="text-lg font-black text-[#111827] mt-1">{product.stock} units</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] text-center shadow-2xs">
              <span className="text-[11px] text-[#64748B] uppercase font-bold">Status</span>
              <div className="mt-1 flex justify-center">
                <Badge variant={product.status === "active" ? "success" : "secondary"}>
                  {product.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Detailed Info Sections */}
          <div className="space-y-4 rounded-2xl border border-[#E2E8F0] bg-slate-50/70 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Description & Craftsmanship
            </h4>
            <p className="text-sm text-[#111827] leading-relaxed">{product.description}</p>
          </div>

          {/* Category & Metadata */}
          <div className="space-y-3 rounded-2xl border border-[#E2E8F0] bg-slate-50/70 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Inventory & Jewellery Specifications
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#E2E8F0]">
                <span className="text-[#64748B]">Category</span>
                <span className="font-semibold text-[#111827]">
                  {product.category?.name || "Imitation Jewellery"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#E2E8F0]">
                <span className="text-[#64748B]">Jewellery Type</span>
                <span className="font-semibold text-[#111827]">
                  {product.jewelleryType || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#E2E8F0]">
                <span className="text-[#64748B]">Material</span>
                <span className="font-semibold text-[#111827]">
                  {product.material || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#E2E8F0]">
                <span className="text-[#64748B]">Colour</span>
                <span className="font-semibold text-[#111827]">
                  {product.colour || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#E2E8F0]">
                <span className="text-[#64748B]">Weight</span>
                <span className="font-semibold text-[#111827]">
                  {product.weight || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#E2E8F0]">
                <span className="text-[#64748B]">Size</span>
                <span className="font-semibold text-[#111827]">
                  {product.size || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#E2E8F0]">
                <span className="text-[#64748B]">Highlights</span>
                <div className="flex items-center gap-1.5">
                  {product.isNewArrival && (
                    <Badge variant="cyan">New Arrival</Badge>
                  )}
                  {product.isBestSeller && (
                    <Badge variant="success">Best Seller</Badge>
                  )}
                  {!product.isNewArrival && !product.isBestSeller && (
                    <span className="text-[#64748B]">Standard Catalog</span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#E2E8F0]">
                <span className="text-[#64748B]">SKU Code</span>
                <span className="font-mono font-semibold text-[#111827]">{product.sku}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#64748B]">Created On</span>
                <span className="font-semibold text-[#111827]">
                  {formatDateTime(product.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> Product Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-[#E2E8F0]">
            <Button
              variant="destructive"
              size="sm"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${product.title}?`)) {
                  deleteMutation.mutate(product.id, {
                    onSuccess: () => closeProductDrawer(),
                  });
                }
              }}
            >
              Delete
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={closeProductDrawer} className="border-[#E2E8F0]">
                Close
              </Button>
              <Link href={`/products/${product.id}/edit`}>
                <Button
                  variant="default"
                  size="sm"
                  leftIcon={<Edit2 className="h-4 w-4" />}
                  onClick={closeProductDrawer}
                  className="bg-[#2563EB] hover:bg-blue-700 text-white"
                >
                  Edit Product
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </Sheet>
  );
}
