import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl border border-cream-200 dark:border-plum-700/40 bg-cream-100/60 dark:bg-plum-900/40 px-3.5 py-2 text-sm text-ink-900 dark:text-cream-50 placeholder:text-ink-500/60 dark:placeholder:text-cream-200/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum-500 focus-visible:border-plum-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
