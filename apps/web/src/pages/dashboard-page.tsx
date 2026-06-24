import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { CanvasEditor } from "@/features/canvas/canvas-editor";

export function DashboardPage() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    toast.success("Logged out");
    navigate("/login");
  }

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50 dark:bg-plum-950">
        <p className="text-ink-500 dark:text-cream-200/60">Loading…</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-cream-50 dark:bg-plum-950">
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
        <span className="text-xs text-ink-500 dark:text-cream-200/60 hidden sm:inline">
          {session?.user.name}
        </span>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-white/80 dark:bg-plum-900/60 backdrop-blur border border-cream-200 dark:border-plum-700/40 hover:bg-cream-100 dark:hover:bg-plum-800/60 text-ink-700 dark:text-cream-100 transition"
        >
          <LogOut size={12} />
          Logout
        </button>
      </div>
      <div className="flex-1 relative">
        <CanvasEditor />
      </div>
    </div>
  );
}
