import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-black shadow hover:bg-primary/90",
        secondary:
          "border-transparent bg-white/10 text-white hover:bg-white/20",
        destructive:
          "border-transparent bg-red-500 text-white shadow hover:bg-red-600",
        outline: "text-white border-white/20",
        success:
          "border-transparent bg-green-500 text-white shadow",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
