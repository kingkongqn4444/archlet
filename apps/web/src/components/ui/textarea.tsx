import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex w-full rounded-xl border border-cream-200 bg-cream-100/60 px-3.5 py-2.5 text-sm",
        "text-ink-900 placeholder:text-ink-500/60 focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-plum-500 focus-visible:border-plum-500 disabled:cursor-not-allowed disabled:opacity-50",
        "dark:border-plum-700/40 dark:bg-plum-900/40 dark:text-cream-50 dark:placeholder:text-cream-200/40",
        "resize-none transition-colors",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
