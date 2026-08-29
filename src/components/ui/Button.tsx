import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "glow";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer rounded-xl active:scale-[0.98]";

    const variants = {
      default:
        "bg-[#2563EB] text-white shadow-sm hover:bg-blue-700 hover:shadow-blue-600/20",
      secondary:
        "bg-slate-100 text-[#111827] hover:bg-slate-200 border border-[#E2E8F0]",
      outline:
        "border border-[#E2E8F0] bg-white text-[#111827] hover:bg-slate-50 hover:border-[#2563EB]/50 shadow-2xs",
      ghost:
        "text-[#64748B] hover:text-[#111827] hover:bg-slate-100",
      destructive:
        "bg-[#DC2626] text-white hover:bg-red-700 shadow-sm hover:shadow-red-600/20",
      glow:
        "bg-[#2563EB] text-white shadow-md shadow-blue-600/25 hover:bg-blue-700 hover:shadow-blue-600/40",
    };

    const sizes = {
      default: "h-10 px-4 py-2 text-sm gap-2",
      sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
      lg: "h-12 px-6 text-base gap-2.5 rounded-xl",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
