import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "muted" | "accent";
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-gray-900/40 border-gray-700/30",
      muted: "bg-gray-800/30 border-gray-600/20",
      accent: "bg-blue-900/20 border-blue-700/30"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border backdrop-blur-md shadow-xl p-6 transition-all duration-200 hover:shadow-2xl hover:border-opacity-50",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };