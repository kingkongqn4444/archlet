import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center bg-cream-50 dark:bg-plum-950 relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-24 w-[480px] h-[480px] rounded-full bg-plum-100 dark:bg-plum-700/20 blur-3xl"
      />
      <div className="relative text-[140px] sm:text-[180px] font-extrabold tracking-tighter leading-none text-plum-200 dark:text-plum-800/60 select-none">
        404
      </div>
      <div className="relative space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink-900 dark:text-cream-50">
          Page not found
        </h1>
        <p className="text-ink-500 dark:text-cream-200/60 max-w-sm">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
      <Link
        to="/d"
        className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-plum-900 text-cream-50 font-semibold tracking-tight hover:bg-plum-700 hover:scale-[1.02] transition-all duration-150 shadow-soft"
      >
        Go to my diagrams
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
