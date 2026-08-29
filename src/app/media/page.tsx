"use client";

import React, { useState } from "react";
import { useMediaAssets, useUploadMutation, useDeleteMediaMutation } from "@/hooks/useUploadMutation";
import { formatFileSize, formatDate } from "@/lib/utils";
import {
  Image as ImageIcon,
  UploadCloud,
  Copy,
  Trash2,
  ExternalLink,
  Check,
  FolderOpen,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";

export default function MediaPage() {
  const { data: media = [], isLoading, refetch, isFetching } = useMediaAssets();
  const uploadMutation = useUploadMutation();
  const deleteMutation = useDeleteMediaMutation();

  const [dragOver, setDragOver] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>("all");

  const handleFileUpload = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      await uploadMutation.mutateAsync({
        file: files[i],
        folder: selectedFolder === "all" ? "products" : selectedFolder,
      });
    }
  };

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Image URL copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMedia = media.filter((item) => {
    if (selectedFolder === "all") return true;
    return item.bucket === selectedFolder;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <ImageIcon className="h-7 w-7 text-primary" /> Media & Supabase Storage Hub
            </h1>
            <Badge variant="secondary" className="font-bold">
              {media.length} Assets
            </Badge>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Upload, browse, and synchronize photography directly with your Supabase Storage bucket.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />}
        >
          Refresh Bucket
        </Button>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files);
          }
        }}
        className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 text-center transition-all bg-card/60 backdrop-blur-xl shadow-lg ${
          dragOver ? "border-primary bg-primary/10" : "border-border/80 hover:border-primary/50"
        }`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white mb-4 shadow-lg shadow-indigo-500/25">
          <UploadCloud className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-foreground">
          Upload Store Photography & Assets
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          Drag and drop multiple image files, or browse local files. Uploaded assets are hosted on Supabase Storage.
        </p>
        <div className="mt-4">
          <label className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90 cursor-pointer">
            Browse Files
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileUpload(e.target.files);
                }
              }}
            />
          </label>
        </div>

        {uploadMutation.isPending && (
          <div className="mt-4 flex items-center gap-2 text-xs text-primary font-semibold">
            <span className="h-3 w-3 rounded-full bg-primary animate-ping" />
            Uploading media to Supabase...
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-3">
        <button
          onClick={() => setSelectedFolder("all")}
          className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
            selectedFolder === "all"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-card"
          }`}
        >
          All Assets ({media.length})
        </button>
        <button
          onClick={() => setSelectedFolder("products")}
          className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
            selectedFolder === "products"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-card"
          }`}
        >
          Products Bucket
        </button>
        <button
          onClick={() => setSelectedFolder("categories")}
          className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
            selectedFolder === "categories"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-card"
          }`}
        >
          Categories Bucket
        </button>
      </div>

      {/* Asset Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="flex h-48 w-full items-center justify-center rounded-2xl border border-dashed border-border/80 text-muted-foreground">
          No media assets found.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMedia.map((asset) => (
            <div
              key={asset.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card/70 backdrop-blur-xl shadow-sm transition-all hover:border-primary/50 hover:shadow-lg"
            >
              {/* Image Preview */}
              <div className="relative aspect-square w-full overflow-hidden bg-muted/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Hover overlay actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => handleCopyUrl(asset.id, asset.url)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white hover:bg-white/40 cursor-pointer"
                    title="Copy URL"
                  >
                    {copiedId === asset.id ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>

                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white hover:bg-white/40 cursor-pointer"
                    title="Open Full Image"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>

                  <button
                    onClick={() => deleteMutation.mutate(asset.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/30 text-rose-300 hover:bg-rose-500/50 cursor-pointer"
                    title="Delete Asset"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Asset Meta info */}
              <div className="p-2.5 space-y-0.5">
                <p className="text-xs font-semibold text-foreground truncate" title={asset.name}>
                  {asset.name}
                </p>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{formatFileSize(asset.size)}</span>
                  <span>{formatDate(asset.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
