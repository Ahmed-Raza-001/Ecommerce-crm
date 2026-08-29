"use client";

import React, { useState } from "react";
import { useProducts, useCreateProduct } from "@/hooks/useProductsQuery";
import { useCategories } from "@/hooks/useCategoriesQuery";
import { Product, ProductFormData } from "@/types/product";
import { formatCurrency, generateSKU } from "@/lib/utils";
import {
  ArrowUpDown,
  Upload,
  Download,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs, TabList, TabTrigger, TabContent } from "@/components/ui/Tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";

export default function ImportExportPage() {
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateProduct();

  const [importData, setImportData] = useState<Partial<ProductFormData>[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        if (file.name.endsWith(".json")) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            setImportData(parsed);
            toast.success(`Parsed ${parsed.length} products from JSON`);
          }
        } else if (file.name.endsWith(".csv")) {
          // Simple CSV parser
          const lines = content.split("\n").filter((l) => l.trim().length > 0);
          const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
          const items: Partial<ProductFormData>[] = [];

          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
            if (values.length >= 3) {
              items.push({
                title: values[0] || `Imported Item ${i}`,
                sku: values[1] || generateSKU("IMP"),
                price: parseFloat(values[2]) || 19.99,
                stock: parseInt(values[3], 10) || 10,
                description: values[4] || "Imported batch catalog item",
                status: "active",
              });
            }
          }
          setImportData(items);
          toast.success(`Parsed ${items.length} products from CSV`);
        }
      } catch (err: any) {
        toast.error("Failed to parse file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleCommitImport = async () => {
    if (importData.length === 0) return;
    setIsImporting(true);
    try {
      for (const item of importData) {
        await createMutation.mutateAsync({
          title: item.title || "Imported Product",
          sku: item.sku || generateSKU("IMP"),
          description: item.description || "Imported item description",
          price: Number(item.price) || 29.99,
          stock: Number(item.stock) || 10,
          status: item.status || "active",
          categoryId: item.categoryId || (categories[0]?.id ?? null),
          image: item.image || null,
        });
      }
      setImportData([]);
      toast.success(`Successfully imported ${importData.length} products!`);
    } catch (err: any) {
      toast.error("Import error: " + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportCSV = () => {
    if (products.length === 0) {
      toast.error("No products available to export");
      return;
    }
    const headers = ["ID", "Title", "SKU", "Category", "Price", "Stock", "Status", "Created At"];
    const rows = products.map((p) => [
      p.id,
      `"${p.title.replace(/"/g, '""')}"`,
      p.sku,
      `"${p.category?.name || "Unassigned"}"`,
      p.price,
      p.stock,
      p.status,
      p.createdAt,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `catalog_export_${Date.now()}.csv`;
    link.click();
    toast.success("CSV file downloaded");
  };

  const handleExportJSON = () => {
    if (products.length === 0) {
      toast.error("No products available to export");
      return;
    }
    const jsonStr = JSON.stringify(products, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `catalog_export_${Date.now()}.json`;
    link.click();
    toast.success("JSON file downloaded");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-6xl mx-auto pb-16">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <ArrowUpDown className="h-7 w-7 text-primary" /> Bulk Import & Export Hub
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          Perform batch catalog migrations using standard CSV spreadsheets and JSON schemas.
        </p>
      </div>

      <Tabs defaultValue="import">
        <TabList className="w-full sm:w-auto">
          <TabTrigger value="import" className="flex-1 sm:flex-none">
            <Upload className="h-3.5 w-3.5 mr-1.5" /> Batch Importer
          </TabTrigger>
          <TabTrigger value="export" className="flex-1 sm:flex-none">
            <Download className="h-3.5 w-3.5 mr-1.5" /> Catalog Exporter
          </TabTrigger>
        </TabList>

        {/* Tab 1: Importer */}
        <TabContent value="import" className="space-y-6 pt-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" /> Upload CSV or JSON File
              </CardTitle>
              <CardDescription>
                Select a spreadsheet or structured file to parse and preview before committing to database.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 p-8 text-center bg-card/40">
                <FileSpreadsheet className="h-10 w-10 text-primary mb-2" />
                <label className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90 cursor-pointer">
                  Choose CSV or JSON File
                  <input
                    type="file"
                    accept=".csv, .json"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
                <span className="text-xs text-muted-foreground mt-2">
                  Accepted headers: Title, SKU, Price, Stock, Description
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Import Preview */}
          {importData.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-base font-bold">
                    Import Preview ({importData.length} Items)
                  </CardTitle>
                  <CardDescription>
                    Review items before syncing into catalog
                  </CardDescription>
                </div>
                <Button
                  variant="glow"
                  onClick={handleCommitImport}
                  isLoading={isImporting}
                  leftIcon={<CheckCircle2 className="h-4 w-4" />}
                >
                  Commit Import
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importData.slice(0, 10).map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-semibold text-foreground">
                          {item.title}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {item.sku}
                        </TableCell>
                        <TableCell className="font-bold text-foreground">
                          {formatCurrency(Number(item.price) || 0)}
                        </TableCell>
                        <TableCell>{item.stock} units</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {importData.length > 10 && (
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    + {importData.length - 10} more items ready for import
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </TabContent>

        {/* Tab 2: Exporter */}
        <TabContent value="export" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-2">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">Export to CSV</CardTitle>
                <CardDescription>
                  Download complete product catalog as a tabular spreadsheet compatible with Excel and Google Sheets.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleExportCSV}
                  leftIcon={<Download className="h-4 w-4" />}
                >
                  Download Catalog.csv ({products.length} items)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-2">
                  <FileCode className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">Export to JSON</CardTitle>
                <CardDescription>
                  Export catalog dataset in raw JSON format for API migrations or backup pipelines.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleExportJSON}
                  leftIcon={<Download className="h-4 w-4" />}
                >
                  Download Catalog.json ({products.length} items)
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabContent>
      </Tabs>
    </div>
  );
}
