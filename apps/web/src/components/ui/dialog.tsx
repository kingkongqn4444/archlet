import * as React from "react";
import { cn } from "@/lib/utils";

type DialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};
const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialog() {
  const ctx = React.useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be inside Dialog");
  return ctx;
}

function Dialog({ children, open, onOpenChange }: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setOpen = (v: boolean) => {
    if (!isControlled) setInternalOpen(v);
    onOpenChange?.(v);
  };
  return (
    <DialogContext.Provider value={{ open: isOpen, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

function DialogTrigger({ children }: { children: React.ReactNode }) {
  const { setOpen } = useDialog();
  return <span onClick={() => setOpen(true)}>{children}</span>;
}

function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open, setOpen } = useDialog();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-plum-950/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div
        className={cn(
          "relative z-50 bg-cream-50 dark:bg-plum-950 rounded-2xl p-6 shadow-float w-full max-w-md border border-cream-200 dark:border-plum-700/40",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

function DialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mb-4 space-y-1.5", className)}>{children}</div>;
}

function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2
      className={cn(
        "text-lg font-bold tracking-tight text-ink-900 dark:text-cream-50",
        className
      )}
    >
      {children}
    </h2>
  );
}

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle };
