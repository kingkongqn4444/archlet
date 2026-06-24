import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-semibold tracking-tight transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum-500 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-plum-900 text-cream-50 hover:bg-plum-700 hover:scale-[1.02] shadow-soft",
        outline:
          "border border-cream-200 dark:border-plum-700/40 bg-white dark:bg-plum-900/40 text-ink-900 dark:text-cream-50 hover:bg-cream-100 dark:hover:bg-plum-800/60",
        ghost:
          "text-ink-700 dark:text-cream-100 hover:bg-cream-100 dark:hover:bg-plum-800/60",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 shadow-soft",
        link:
          "text-plum-700 dark:text-plum-300 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-4",
        lg: "h-12 px-8 text-base rounded-2xl",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
