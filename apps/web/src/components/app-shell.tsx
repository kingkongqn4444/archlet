import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Top bar */}
      <header className="h-9 flex items-center justify-between px-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          archlet
        </span>
        <div className="flex items-center gap-2">
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
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <ProjectsSidebar
          selectedProjectId={selectedProjectId}
          onSelectProject={handleSelectProject}
        />
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
}
