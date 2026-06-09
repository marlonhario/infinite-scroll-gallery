import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "emerald" | "indigo";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        {
          "border-transparent bg-indigo-600 text-white": variant === "default",
          "border-transparent bg-slate-700 text-slate-200": variant === "secondary",
          "border-slate-600 text-slate-300": variant === "outline",
          "border-transparent bg-emerald-600 text-white": variant === "emerald",
          "border-transparent bg-indigo-500/20 text-indigo-300 border-indigo-500/30":
            variant === "indigo",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
