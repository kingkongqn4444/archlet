import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="absolute top-2 right-36 z-20 flex items-center gap-2">
        <span className="text-xs text-slate-400 hidden sm:inline">
          {session?.user.name}
        </span>
        <button
          onClick={handleLogout}
          className="text-xs px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
        >
          Logout
        </button>
      </div>
      <div className="flex-1 relative">
        <CanvasEditor />
      </div>
    </div>
  );
}
