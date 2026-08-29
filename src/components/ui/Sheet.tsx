"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  side?: "right" | "left";
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Sheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  side = "right",
  className,
  size = "md",
}: SheetProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-xl",
    xl: "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      <div className={cn("fixed inset-y-0 flex max-w-full", side === "right" ? "right-0" : "left-0")}>
        <div
          className={cn(
            "w-screen bg-card/95 border-l border-border/80 p-6 shadow-2xl backdrop-blur-2xl flex flex-col transition-all duration-300 animate-in slide-in-from-right",
            sizes[size],
            className
          )}
        >
          <div className="flex items-center justify-between pb-4 border-b border-border/40">
            <div>
              {title && <h2 className="text-xl font-bold text-foreground">{title}</h2>}
              {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
