import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-xl border px-3 py-1 text-xs font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:ring-offset-1",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-panel text-muted",
        secondary:
          "border-transparent bg-panel text-muted hover:bg-panel/80",
        accent:
          "border-transparent bg-accent text-accent-foreground hover:bg-accent/90",
        destructive:
          "border-transparent bg-destructive/10 text-destructive border-destructive/20",
        outline: "border-border text-muted hover:bg-panel",
        success: "border-transparent bg-accent/10 text-accent border-accent/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
