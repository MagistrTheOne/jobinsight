import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "muted" | "accent";
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-black/40 border-white/10 backdrop-blur-xl",
      muted: "bg-black/30 border-white/5 backdrop-blur-lg",
      accent: "bg-blue-900/20 border-blue-700/30 backdrop-blur-xl"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border backdrop-blur-md shadow-xl p-6 transition-all duration-200 hover:shadow-2xl hover:border-opacity-50 hover:scale-[1.01]",
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