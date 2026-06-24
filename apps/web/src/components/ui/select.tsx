import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      className={cn(
        "flex h-10 w-full rounded-xl border border-cream-200 bg-cream-100/60 px-3 py-2 text-sm",
        "text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum-500 focus-visible:border-plum-500",
        "disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
        "dark:border-plum-700/40 dark:bg-plum-900/40 dark:text-cream-50",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

export { Select };
