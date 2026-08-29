"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Category, CategoryFormData } from "@/types/category";
import { useUploadMutation } from "@/hooks/useUploadMutation";
import { slugify } from "@/lib/utils";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { UploadCloud, Save, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().optional(),
  parentId: z.union([z.string(), z.number()]).nullable().optional(),
  isActive: z.boolean(),
  image: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof categorySchema>;

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  categories: Category[];
  onSubmit: (data: CategoryFormData) => Promise<void>;
  isLoading?: boolean;
}

export function CategoryFormModal({
  isOpen,
  onClose,
  category,
  categories,
  onSubmit,
  isLoading = false,
}: CategoryFormModalProps) {
  const uploadMutation = useUploadMutation();
  const [previewImage, setPreviewImage] = useState<string | null>(category?.image || null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parentId: null,
      isActive: true,
      image: null,
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        parentId: category.parentId || null,
        isActive: category.isActive,
        image: category.image || null,
      });
      setPreviewImage(category.image || null);
    } else {
      reset({
        name: "",
        slug: "",
        description: "",
        parentId: null,
        isActive: true,
        image: null,
      });
      setPreviewImage(null);
    }
  }, [category, reset, isOpen]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("name", val);
    if (!category) {
      setValue("slug", slugify(val));
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const res = await uploadMutation.mutateAsync({ file, folder: "categories" });
      if (res?.url) {
        setValue("image", res.url);
        setPreviewImage(res.url);
      }
    } catch (err: any) {
      toast.error("Upload failed: " + err.message);
    }
  };

  const onFormSubmit = async (values: FormValues) => {
    await onSubmit({
      name: values.name,
      slug: values.slug || slugify(values.name),
      description: values.description,
      parentId: values.parentId || null,
      isActive: values.isActive,
      image: previewImage || values.image || null,
    });
    onClose();
  };

  // Filter out self if editing
  const availableParents = categories.filter((c) => !category || String(c.id) !== String(category.id));

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={category ? `Edit Category: ${category.name}` : "Create Category"}
      description="Organize your Imitation Jewellery catalog hierarchy and assign subcategories."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5 pt-2">
        <Input
          label="Category Name *"
          placeholder="e.g. Necklace Sets & Chokers"
          {...register("name")}
          onChange={handleNameChange}
          error={errors.name?.message}
          className="bg-[#F8FAFC]"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="URL Slug *"
            placeholder="e.g. necklace-sets-chokers"
            {...register("slug")}
            error={errors.slug?.message}
            className="bg-[#F8FAFC]"
          />

          <Select label="Parent Category (Optional)" {...register("parentId")} className="bg-[#F8FAFC]">
            <option value="">None (Top-Level Category)</option>
            {availableParents.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
        </div>

        <Textarea
          label="Description"
          placeholder="Brief summary of imitation jewelry items categorized under this group..."
          rows={3}
          {...register("description")}
          className="bg-[#F8FAFC]"
        />

        {/* Thumbnail Image */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            Category Thumbnail Image
          </label>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl border border-[#E2E8F0] bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
              {previewImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewImage} alt="Category" className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-6 w-6 text-[#64748B] opacity-40" />
              )}
            </div>

            <div className="flex-1 space-y-1.5">
              <label className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-[#111827] hover:bg-slate-200 cursor-pointer border border-[#E2E8F0]">
                <UploadCloud className="h-4 w-4 text-[#2563EB]" />
                Upload Image
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
              <Input
                placeholder="Or paste image URL"
                value={watch("image") || ""}
                onChange={(e) => {
                  setValue("image", e.target.value);
                  setPreviewImage(e.target.value);
                }}
                className="h-8 text-xs bg-[#F8FAFC]"
              />
            </div>
          </div>
        </div>

        {/* Status Toggle */}
        <div className="pt-2">
          <Switch
            checked={watch("isActive")}
            onCheckedChange={(checked) => setValue("isActive", checked)}
            label="Active Category"
            description="Active categories are visible to customers on the frontend catalog."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
          <Button type="button" variant="outline" onClick={onClose} className="border-[#E2E8F0]">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            isLoading={isLoading}
            leftIcon={<Save className="h-4 w-4" />}
            className="bg-[#2563EB] hover:bg-blue-700 text-white"
          >
            {category ? "Save Changes" : "Create Category"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
