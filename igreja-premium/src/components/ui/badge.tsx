import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.12em] uppercase",
  {
    variants: {
      variant: {
        default: "border-amber-300/45 bg-amber-300/12 text-amber-100",
        success: "border-emerald-300/45 bg-emerald-300/12 text-emerald-100",
        info: "border-sky-300/45 bg-sky-300/12 text-sky-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
