import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { LogOut, UserCircle2 } from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { ProjectsSidebar } from "@/features/projects/projects-sidebar";

interface Props {
  children: React.ReactNode;
  /** Active project — controls sidebar highlight */
  activeProjectId?: string | null;
  /** Called when user selects a project in sidebar */
  onProjectSelect?: (id: string) => void;
}

export function AppShell({ children, activeProjectId = null, onProjectSelect }: Props) {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    activeProjectId
  );

  useEffect(() => {
    setSelectedProjectId(activeProjectId);
  }, [activeProjectId]);

  function handleSelectProject(id: string) {
    setSelectedProjectId(id);
    onProjectSelect?.(id);
  }

  async function handleLogout() {
    await signOut();
    toast.success("Logged out");
    navigate("/login");
  }

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-cream-50 dark:bg-plum-950">
      {/* Top bar */}
      <header className="h-11 flex items-center justify-between px-4 border-b border-cream-200 dark:border-plum-700/30 bg-white/80 dark:bg-plum-900/40 backdrop-blur shrink-0">
        <Link to="/" className="text-sm font-bold tracking-tight text-ink-900 dark:text-cream-50">
          archlet<span className="text-plum-500">.</span>
        </Link>
        <div className="flex items-center gap-1">
          <span className="text-xs text-ink-500 dark:text-cream-200/60 hidden sm:inline mr-2">
            {session?.user.name}
          </span>
          <Link
            to="/account"
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full hover:bg-cream-100 dark:hover:bg-plum-800/50 text-ink-700 dark:text-cream-100 transition"
          >
            <UserCircle2 size={13} />
            Account
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full hover:bg-cream-100 dark:hover:bg-plum-800/50 text-ink-700 dark:text-cream-100 transition"
          >
            <LogOut size={13} />
            Logout
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <ProjectsSidebar
          selectedProjectId={selectedProjectId}
          onSelectProject={handleSelectProject}
        />
        <main className="flex-1 overflow-hidden relative bg-cream-50 dark:bg-plum-950">
          {children}
        </main>
      </div>
    </div>
  );
}
