import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "outline" | "purple" | "cyan";
  dot?: boolean;
}

export function Badge({ className, variant = "default", dot = false, children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-blue-50 text-[#2563EB] border-blue-200",
    secondary: "bg-slate-100 text-[#64748B] border-[#E2E8F0]",
    success: "bg-emerald-50 text-[#16A34A] border-emerald-200",
    warning: "bg-amber-50 text-[#D97706] border-amber-200",
    destructive: "bg-red-50 text-[#DC2626] border-red-200",
    outline: "border-[#E2E8F0] text-[#64748B] bg-white",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-200",
  };

  const dotColors = {
    default: "bg-[#2563EB]",
    secondary: "bg-[#64748B]",
    success: "bg-[#16A34A]",
    warning: "bg-[#F59E0B]",
    destructive: "bg-[#DC2626]",
    outline: "bg-[#64748B]",
    purple: "bg-purple-600",
    cyan: "bg-cyan-600",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[variant])} />}
      {children}
    </div>
  );
}
