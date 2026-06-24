import { Navigate } from "react-router-dom";
import { useSession } from "@/lib/auth-client";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50 dark:bg-plum-950">
        <p className="text-ink-500 dark:text-cream-200/60">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
