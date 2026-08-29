"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { useSelectionStore } from "@/store/useSelectionStore";
import { useUIStore } from "@/store/useUIStore";
import { useDeleteProduct, useUpdateProduct } from "@/hooks/useProductsQuery";
import { formatCurrency } from "@/lib/utils";
import {
  Package,
  Eye,
  Edit2,
  Trash2,
  Plus,
  Minus,
} from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";

interface ProductTableProps {
  products: Product[];
}

export function ProductTable({ products }: ProductTableProps) {
  const { toggleSelectProduct, selectProducts, clearSelection, isSelected } =
    useSelectionStore();
  const { openProductDrawer } = useUIStore();
  const deleteMutation = useDeleteProduct();
  const updateMutation = useUpdateProduct();

  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const allSelected = products.length > 0 && products.every((p) => isSelected(p.id));

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectProducts(products.map((p) => p.id));
    }
  };

  const handleStockAdjust = (product: Product, delta: number) => {
    const newStock = Math.max(0, Number(product.stock) + delta);
    updateMutation.mutate({
      id: product.id,
      data: { stock: newStock },
    });
  };

  return (
    <>
      <div className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 border-b border-[#E2E8F0]">
              <TableHead className="w-12 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-[#64748B]">
                  No products found matching the filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const selected = isSelected(product.id);
                const isLowStock = product.stock > 0 && product.stock <= 5;
                const isOutOfStock = product.stock === 0;

                return (
                  <TableRow
                    key={product.id}
                    className={`border-b border-[#E2E8F0] hover:bg-slate-50/80 transition-colors ${
                      selected ? "bg-blue-50/50" : ""
                    }`}
                  >
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleSelectProduct(product.id)}
                        className="h-4 w-4 rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => openProductDrawer(product.id)}
                          className="h-12 w-12 rounded-xl overflow-hidden border border-[#E2E8F0] bg-slate-50 shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
                        >
                          {product.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.image}
                              alt={product.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[#64748B]">
                              <Package className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span
                            onClick={() => openProductDrawer(product.id)}
                            className="font-bold text-[#111827] hover:text-[#2563EB] transition-colors cursor-pointer text-sm"
                          >
                            {product.title}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {product.tags?.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="inline-block text-[10px] rounded bg-slate-100 px-1.5 py-0.2 text-[#64748B]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#64748B] font-semibold">
                      {product.sku}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium">
                        {product.category?.name || "Unassigned"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-[#111827]">
                          {formatCurrency(product.price)}
                        </span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="text-[11px] text-[#64748B] line-through">
                            {formatCurrency(product.compareAtPrice)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-lg border border-[#E2E8F0] bg-slate-50 p-0.5">
                          <button
                            type="button"
                            onClick={() => handleStockAdjust(product, -1)}
                            disabled={product.stock <= 0}
                            className="h-6 w-6 rounded flex items-center justify-center text-[#64748B] hover:bg-white hover:text-[#111827] disabled:opacity-30 cursor-pointer shadow-2xs"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-[#111827]">
                            {product.stock}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleStockAdjust(product, 1)}
                            className="h-6 w-6 rounded flex items-center justify-center text-[#64748B] hover:bg-white hover:text-[#111827] cursor-pointer shadow-2xs"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {isOutOfStock ? (
                          <Badge variant="destructive" dot>Out</Badge>
                        ) : isLowStock ? (
                          <Badge variant="warning" dot>Low</Badge>
                        ) : null}
                      </div>
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
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openProductDrawer(product.id)}
                          title="View Details"
                          className="h-8 w-8 text-[#64748B] hover:text-[#2563EB]"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Link href={`/products/${product.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit Product"
                            className="h-8 w-8 text-[#64748B] hover:text-[#2563EB]"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setProductToDelete(product)}
                          title="Delete Product"
                          className="h-8 w-8 text-[#64748B] hover:text-[#DC2626]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Single Delete Confirmation Dialog */}
      <Dialog
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        title="Delete Product"
        description={`Are you sure you want to remove "${productToDelete?.title}" from the catalog?`}
        maxWidth="sm"
      >
        <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
          <Button variant="outline" onClick={() => setProductToDelete(null)}>
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
            Delete Product
          </Button>
        </div>
      </Dialog>
    </>
  );
}
