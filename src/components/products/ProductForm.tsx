"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Product, ProductFormData } from "@/types/product";
import { Category } from "@/types/category";
import { useUploadMutation } from "@/hooks/useUploadMutation";
import { formatCurrency, generateSKU } from "@/lib/utils";
import {
  UploadCloud,
  Image as ImageIcon,
  Sparkles,
  Package,
  Wand2,
  DollarSign,
  Save,
  ArrowLeft,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";

const productSchema = z.object({
  title: z.string().min(2, "Product title must be at least 2 characters"),
  sku: z.string().min(2, "SKU code is required"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  compareAtPrice: z.coerce.number().optional(),
  costPrice: z.coerce.number().optional(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  status: z.enum(["active", "draft", "out_of_stock"]),
  isNewArrival: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  jewelleryType: z.string().optional(),
  material: z.string().optional(),
  colour: z.string().optional(),
  weight: z.string().optional(),
  size: z.string().optional(),
  categoryId: z.union([z.string(), z.number()]).nullable().optional(),
  image: z.string().nullable().optional(),
  tagsString: z.string().optional(),
});

type FormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Product | null;
  categories: Category[];
  onSubmit: (data: ProductFormData) => Promise<void>;
  isLoading?: boolean;
}

export function ProductForm({
  initialData,
  categories,
  onSubmit,
  isLoading = false,
}: ProductFormProps) {
  const router = useRouter();
  const uploadMutation = useUploadMutation();
  const [dragOver, setDragOver] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(initialData?.image || null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: initialData?.title || "",
      sku: initialData?.sku || generateSKU("JWL"),
      description: initialData?.description || "",
      price: initialData?.price || 1499,
      compareAtPrice: initialData?.compareAtPrice || 0,
      costPrice: initialData?.costPrice || 0,
      stock: initialData?.stock !== undefined ? initialData.stock : 20,
      status: initialData?.status || "active",
      isNewArrival: initialData?.isNewArrival || false,
      isBestSeller: initialData?.isBestSeller || false,
      jewelleryType: initialData?.jewelleryType || "",
      material: initialData?.material || "",
      colour: initialData?.colour || "",
      weight: initialData?.weight || "",
      size: initialData?.size || "",
      categoryId: initialData?.categoryId || (categories[0]?.id ?? null),
      image: initialData?.image || null,
      tagsString: initialData?.tags?.join(", ") || "",
    },
  });

  const watchedValues = watch();

  const handleFileUpload = async (file: File) => {
    try {
      const result = await uploadMutation.mutateAsync({ file, folder: "products" });
      if (result?.url) {
        setValue("image", result.url);
        setPreviewImage(result.url);
      }
    } catch (err: any) {
      toast.error("File upload failed: " + err.message);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleAutoGenerateSKU = () => {
    const titlePrefix = watchedValues.title ? watchedValues.title.substring(0, 3).toUpperCase() : "JWL";
    const newSku = generateSKU(titlePrefix);
    setValue("sku", newSku);
    toast.info(`Generated SKU: ${newSku}`);
  };

  const onFormSubmit = async (values: FormValues) => {
    const tags = values.tagsString
      ? values.tagsString
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    await onSubmit({
      title: values.title,
      sku: values.sku,
      description: values.description,
      price: Number(values.price),
      compareAtPrice: values.compareAtPrice ? Number(values.compareAtPrice) : undefined,
      costPrice: values.costPrice ? Number(values.costPrice) : undefined,
      stock: Number(values.stock),
      status: values.status,
      isNewArrival: values.isNewArrival,
      isBestSeller: values.isBestSeller,
      jewelleryType: values.jewelleryType,
      material: values.material,
      colour: values.colour,
      weight: values.weight,
      size: values.size,
      categoryId: values.categoryId || null,
      image: previewImage || values.image || null,
      tags,
    });
  };

  const selectedCategoryName =
    categories.find((c) => String(c.id) === String(watchedValues.categoryId))?.name || "Imitation Jewellery";

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8 pb-16">
      {/* Top action header */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          className="text-[#64748B] hover:text-[#111827]"
        >
          Back to Products
        </Button>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/products")}
            className="border-[#E2E8F0] text-[#111827]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            isLoading={isLoading}
            leftIcon={<Save className="h-4 w-4" />}
            className="bg-[#2563EB] hover:bg-blue-700 text-white shadow-xs"
          >
            {initialData ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Main Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Basic Information */}
          <Card className="bg-white border-[#E2E8F0] shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-[#111827]">
                <Package className="h-4 w-4 text-[#2563EB]" /> Product Information
              </CardTitle>
              <CardDescription className="text-[#64748B]">
                Define primary catalog specifications and identification codes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Product Title *"
                placeholder="e.g. Royal Kundan & Pearl Choker Necklace Set"
                {...register("title")}
                error={errors.title?.message}
                className="bg-[#F8FAFC]"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                      SKU Code *
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoGenerateSKU}
                      className="flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:underline cursor-pointer"
                    >
                      <Wand2 className="h-3 w-3" /> Auto SKU
                    </button>
                  </div>
                  <Input
                    placeholder="e.g. JWL-KDN-101"
                    {...register("sku")}
                    error={errors.sku?.message}
                    className="bg-[#F8FAFC]"
                  />
                </div>

                <Select
                  label="Category"
                  {...register("categoryId")}
                  error={errors.categoryId?.message as string}
                  className="bg-[#F8FAFC]"
                >
                  <option value="">Select a Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </div>

              <Textarea
                label="Product Description *"
                rows={4}
                placeholder="Provide comprehensive details about jewelry craftsmanship, plating material, stone type, lock mechanism, and care instructions..."
                {...register("description")}
                error={errors.description?.message}
                className="bg-[#F8FAFC]"
              />

              <Input
                label="Tags (Comma separated)"
                placeholder="Kundan, 24K Gold Plated, Bridal, Jhumka, Festival"
                {...register("tagsString")}
                className="bg-[#F8FAFC]"
              />
            </CardContent>
          </Card>

          {/* Section: Jewellery Specifications & Badges */}
          <Card className="bg-white border-[#E2E8F0] shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-[#111827]">
                <Sparkles className="h-4 w-4 text-[#2563EB]" /> Jewellery Attributes & Specs
              </CardTitle>
              <CardDescription className="text-[#64748B]">
                Specify craftsmanship metrics, material details, sizing, and storefront highlight badges
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Jewellery Type"
                  placeholder="e.g. Necklace Set, Earrings, Ring, Bangles"
                  {...register("jewelleryType")}
                  className="bg-[#F8FAFC]"
                />
                <Input
                  label="Material"
                  placeholder="e.g. 24K Gold Plated, Kundan, Brass"
                  {...register("material")}
                  className="bg-[#F8FAFC]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Colour"
                  placeholder="e.g. Ruby Red, Emerald Green, Gold"
                  {...register("colour")}
                  className="bg-[#F8FAFC]"
                />
                <Input
                  label="Weight"
                  placeholder="e.g. 45g"
                  {...register("weight")}
                  className="bg-[#F8FAFC]"
                />
                <Input
                  label="Size"
                  placeholder="e.g. Adjustable / 18 Inches / 2.4"
                  {...register("size")}
                  className="bg-[#F8FAFC]"
                />
              </div>

              {/* Toggles for New Arrival & Best Seller */}
              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-[#E2E8F0]">
                <label className="flex items-center gap-2 text-sm font-semibold text-[#111827] cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("isNewArrival")}
                    className="h-4 w-4 rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                  />
                  <span>Mark as New Arrival</span>
                </label>

                <label className="flex items-center gap-2 text-sm font-semibold text-[#111827] cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("isBestSeller")}
                    className="h-4 w-4 rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                  />
                  <span>Mark as Best Seller</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Pricing & Inventory */}
          <Card className="bg-white border-[#E2E8F0] shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-[#111827]">
                <DollarSign className="h-4 w-4 text-[#16A34A]" /> Pricing & Inventory Levels
              </CardTitle>
              <CardDescription className="text-[#64748B]">
                Configure selling price, compare-at retail price, and warehouse stock units
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Selling Price ($) *"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("price")}
                  error={errors.price?.message}
                  className="bg-[#F8FAFC]"
                />

                <Input
                  label="Compare-at Price ($)"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  helperText="Original MSRP for strikethrough"
                  {...register("compareAtPrice")}
                  className="bg-[#F8FAFC]"
                />

                <Input
                  label="Cost of Goods (COGS $)"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  helperText="For profit margin tracking"
                  {...register("costPrice")}
                  className="bg-[#F8FAFC]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Input
                  label="Available Stock Units *"
                  type="number"
                  placeholder="0"
                  {...register("stock")}
                  error={errors.stock?.message}
                  className="bg-[#F8FAFC]"
                />

                <Select label="Status" {...register("status")} className="bg-[#F8FAFC]">
                  <option value="active">Active (Published to Catalog)</option>
                  <option value="draft">Draft (Hidden)</option>
                  <option value="out_of_stock">Out of Stock</option>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Media Upload & Supabase Storage */}
          <Card className="bg-white border-[#E2E8F0] shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-[#111827]">
                <UploadCloud className="h-4 w-4 text-[#2563EB]" /> Product Image & Media
              </CardTitle>
              <CardDescription className="text-[#64748B]">
                Upload high-resolution jewelry photography directly to backend storage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                  dragOver
                    ? "border-[#2563EB] bg-blue-50/50"
                    : "border-[#E2E8F0] bg-slate-50 hover:border-[#2563EB]/50"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#2563EB] mb-3">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-[#111827]">
                  Drag and drop your jewelry image here, or{" "}
                  <label className="text-[#2563EB] hover:underline cursor-pointer">
                    browse files
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </p>
                <p className="text-xs text-[#64748B] mt-1">
                  Supports PNG, JPG, WEBP up to 10MB
                </p>
                {uploadMutation.isPending && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-[#2563EB] font-semibold">
                    <span className="h-3 w-3 rounded-full bg-[#2563EB] animate-ping" />
                    Uploading image to storage...
                  </div>
                )}
              </div>

              {/* Direct URL input */}
              <Input
                label="Or paste Image URL directly"
                placeholder="https://images.unsplash.com/photo-..."
                value={watchedValues.image || ""}
                onChange={(e) => {
                  setValue("image", e.target.value);
                  setPreviewImage(e.target.value);
                }}
                className="bg-[#F8FAFC]"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Storefront Card Preview */}
        <div className="space-y-6">
          <Card className="sticky top-24 border-[#E2E8F0] shadow-sm bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-[#111827]">
                <Sparkles className="h-4 w-4 text-[#2563EB]" /> Live Storefront Preview
              </CardTitle>
              <CardDescription className="text-[#64748B]">
                Real-time preview of how customers view this item
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs transition-all">
                {/* Preview Image */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-50 flex items-center justify-center">
                  {previewImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-[#64748B]">
                      <ImageIcon className="h-10 w-10 opacity-30 mb-1" />
                      <span className="text-xs">No image selected</span>
                    </div>
                  )}

                  {/* Status badge */}
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant={
                        watchedValues.status === "active"
                          ? "success"
                          : watchedValues.status === "draft"
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {watchedValues.status}
                    </Badge>
                  </div>
                </div>

                {/* Preview Content */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span className="font-mono">{watchedValues.sku || "SKU-PENDING"}</span>
                    <span className="font-semibold text-[#2563EB]">{selectedCategoryName}</span>
                  </div>

                  <h3 className="font-bold text-base text-[#111827] line-clamp-1">
                    {watchedValues.title || "Product Title Goes Here"}
                  </h3>

                  <p className="text-xs text-[#64748B] line-clamp-2">
                    {watchedValues.description ||
                      "Add a product description to preview customer details..."}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
                    <div className="flex flex-col">
                      <span className="text-xl font-black text-[#111827]">
                        {formatCurrency(Number(watchedValues.price) || 0)}
                      </span>
                      {Number(watchedValues.compareAtPrice) > Number(watchedValues.price) && (
                        <span className="text-xs text-[#64748B] line-through">
                          {formatCurrency(Number(watchedValues.compareAtPrice))}
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-[#16A34A] font-semibold">
                      {watchedValues.stock ?? 0} in stock
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
