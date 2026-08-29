"use client";

import React, { useState } from "react";
import { useSelectionStore } from "@/store/useSelectionStore";
import { useBulkDeleteProducts } from "@/hooks/useProductsQuery";
import { Trash2, Download, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Product } from "@/types/product";

interface BulkActionBarProps {
  products: Product[];
}

export function BulkActionBar({ products }: BulkActionBarProps) {
  const { selectedProductIds, clearSelection } = useSelectionStore();
  const bulkDeleteMutation = useBulkDeleteProducts();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (selectedProductIds.length === 0) return null;

  const handleDelete = () => {
    bulkDeleteMutation.mutate(selectedProductIds, {
      onSuccess: () => {
        clearSelection();
        setShowConfirmDelete(false);
      },
    });
  };

  const handleExportSelectedCSV = () => {
    const selected = products.filter((p) =>
      selectedProductIds.some((id) => String(id) === String(p.id))
    );
    if (selected.length === 0) return;

    const headers = ["ID", "Title", "SKU", "Category", "Price", "Stock", "Status", "Created At"];
    const rows = selected.map((p) => [
      p.id,
      `"${p.title.replace(/"/g, '""')}"`,
      p.sku,
      `"${p.category?.name || "Imitation Jewellery"}"`,
      p.price,
      p.stock,
      p.status,
      p.createdAt,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `jewellery_products_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 rounded-2xl border border-[#E2E8F0] bg-white px-5 py-3 shadow-xl animate-in slide-in-from-bottom-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#111827] border-r border-[#E2E8F0] pr-4">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#2563EB] text-white text-xs font-bold">
            {selectedProductIds.length}
          </div>
          <span>Selected</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportSelectedCSV}
            leftIcon={<Download className="h-3.5 w-3.5" />}
            className="border-[#E2E8F0] text-[#111827]"
          >
            Export Selected CSV
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowConfirmDelete(true)}
            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
          >
            Delete Selected
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={clearSelection}
            title="Clear Selection"
            className="h-8 w-8 text-[#64748B] hover:text-[#111827]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        title="Confirm Bulk Deletion"
        description={`Are you sure you want to permanently delete ${selectedProductIds.length} selected products? This action cannot be undone.`}
        maxWidth="md"
      >
        <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
          <Button variant="outline" onClick={() => setShowConfirmDelete(false)} className="border-[#E2E8F0]">
            Cancel
          </Button>
          <Button
            variant="destructive"
            isLoading={bulkDeleteMutation.isPending}
            onClick={handleDelete}
          >
            Yes, Delete {selectedProductIds.length} Products
          </Button>
        </div>
      </Dialog>
    </>
  );
}
