import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center bg-white dark:bg-slate-950">
      <div className="text-7xl font-extrabold text-slate-200 dark:text-slate-800 select-none">
        404
      </div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Page not found
      </h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/d" className={cn(buttonVariants())}>
        Go to my diagrams
      </Link>
    </div>
  );
}
