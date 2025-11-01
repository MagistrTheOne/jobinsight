import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "muted" | "accent";
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-black/60 border-white/5 backdrop-blur-2xl",
      muted: "bg-black/40 border-white/5 backdrop-blur-xl",
      accent: "bg-blue-900/20 border-blue-700/30 backdrop-blur-2xl"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border shadow-xl p-4 sm:p-6 transition-all duration-200 hover:shadow-2xl hover:border-white/10",
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