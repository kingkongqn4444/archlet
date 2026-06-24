import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { ChevronDown, LogOut, UserCircle2 } from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { ProjectsSidebar } from "@/features/projects/projects-sidebar";

interface Props {
  children: React.ReactNode;
  /** Active project — controls sidebar highlight */
  activeProjectId?: string | null;
  /** Called when user selects a project in sidebar */
  onProjectSelect?: (id: string) => void;
}

/** Tiny brand mark — a stacked-triangle "network" glyph in plum. */
function BrandMark() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M7 1.5 L12.2 11 H1.8 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        className="text-plum-500"
      />
      <circle cx="7" cy="5.2" r="1.2" fill="currentColor" className="text-plum-500" />
    </svg>
  );
}

function initialsOf(name?: string | null, email?: string | null): string {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/);
    const a = parts[0]?.[0] ?? "";
    const b = parts[1]?.[0] ?? "";
    return (a + b).toUpperCase() || a.toUpperCase();
  }
  return (email?.[0] ?? "U").toUpperCase();
}

export function AppShell({ children, activeProjectId = null, onProjectSelect }: Props) {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    activeProjectId
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSelectedProjectId(activeProjectId);
  }, [activeProjectId]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function handleSelectProject(id: string) {
    setSelectedProjectId(id);
    onProjectSelect?.(id);
  }

  async function handleLogout() {
    setMenuOpen(false);
    await signOut();
    toast.success("Logged out");
    navigate("/login");
  }

  const initials = initialsOf(session?.user.name, session?.user.email);

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden archlet-canvas-bg">
      {/* Top bar — refined wordmark + avatar dropdown */}
      <header
        className="h-11 flex items-center justify-between px-4 bg-white/85 dark:bg-plum-900/55 backdrop-blur shrink-0 relative
                   border-b border-cream-200/80 dark:border-plum-700/30
                   before:content-[''] before:absolute before:left-0 before:right-0 before:bottom-[-1px] before:h-px
                   before:bg-gradient-to-r before:from-transparent before:via-plum-200/50 before:to-transparent
                   dark:before:via-plum-500/20"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[14px] font-bold tracking-[-0.01em] text-ink-900 dark:text-cream-50 hover:opacity-90 transition"
        >
          <BrandMark />
          <span>archlet<span className="text-plum-500">.</span></span>
        </Link>

        <div ref={menuRef} className="relative flex items-center gap-1">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            title={session?.user.name ?? session?.user.email ?? "Account"}
            className="inline-flex items-center gap-1.5 pl-1 pr-1.5 py-1 rounded-full hover:bg-cream-100 dark:hover:bg-plum-800/50 transition group"
          >
            <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-gradient-to-br from-plum-500 to-plum-700 text-cream-50 text-[10px] font-bold tracking-tight shadow-soft">
              {initials}
            </span>
            <ChevronDown
              size={12}
              className={`text-ink-500 dark:text-cream-200/60 transition-transform ${menuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute top-full right-0 mt-1.5 min-w-[180px] py-1 bg-white dark:bg-plum-900 border border-cream-200 dark:border-plum-700/40 rounded-xl shadow-float z-50 animate-slide-in-right"
            >
              <div className="px-3 py-2 border-b border-cream-200 dark:border-plum-700/40">
                <p className="text-[12px] font-semibold text-ink-900 dark:text-cream-50 truncate">
                  {session?.user.name ?? "User"}
                </p>
                <p className="text-[11px] text-ink-500 dark:text-cream-200/60 truncate">
                  {session?.user.email}
                </p>
              </div>
              <Link
                to="/account"
                onClick={() => setMenuOpen(false)}
                role="menuitem"
                className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-ink-700 dark:text-cream-100 hover:bg-cream-100 dark:hover:bg-plum-800/40 transition"
              >
                <UserCircle2 size={13} />
                Account
              </Link>
              <button
                onClick={handleLogout}
                role="menuitem"
                className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-ink-700 dark:text-cream-100 hover:bg-cream-100 dark:hover:bg-plum-800/40 transition text-left"
              >
                <LogOut size={13} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <ProjectsSidebar
          selectedProjectId={selectedProjectId}
          onSelectProject={handleSelectProject}
        />
        <main className="flex-1 overflow-hidden relative archlet-canvas-bg">
          {children}
        </main>
      </div>
    </div>
  );
}
