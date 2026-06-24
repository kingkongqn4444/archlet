import * as React from "react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function Sheet({ open, onOpenChange, children }: SheetProps) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) onOpenChange(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* backdrop */}
      <div
        className="fixed inset-0 bg-black/30"
        onClick={() => onOpenChange(false)}
      />
      {children}
    </div>
  );
}

function SheetContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "fixed right-0 top-0 h-full w-80 bg-cream-50 dark:bg-plum-950 shadow-float flex flex-col z-50",
        "border-l border-cream-200 dark:border-plum-700/40",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

function SheetHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-4 py-3 border-b border-cream-200 dark:border-plum-700/40 shrink-0", className)}>
      {children}
    </div>
  );
}

function SheetTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("text-sm font-semibold", className)}>{children}</h2>;
}

function SheetBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex-1 overflow-y-auto px-4 py-3", className)}>
      {children}
    </div>
  );
}

export { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody };
