import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Monitor, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient, useSession } from "@/lib/auth-client";

interface SessionItem {
  id: string;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresAt: Date | string;
  createdAt: Date | string;
}

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleString();
}

function parseAgent(ua: string | null | undefined): string {
  if (!ua) return "Unknown device";
  if (ua.includes("Mobile")) return "Mobile browser";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  return "Browser";
}

export function SessionsTab() {
  const { data: sessionData } = useSession();
  const [sessions, setSessions] = useState<SessionItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  async function loadSessions() {
    setLoading(true);
    try {
      const res = await authClient.listSessions();
      if (res.error) {
        toast.error(res.error.message ?? "Failed to load sessions");
      } else {
        setSessions((res.data ?? []) as SessionItem[]);
      }
    } catch {
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke(token: string) {
    setRevoking(token);
    try {
      const res = await authClient.revokeSession({ token });
      if (res.error) {
        toast.error(res.error.message ?? "Failed to revoke session");
      } else {
        setSessions((prev) => prev?.filter((s) => s.token !== token) ?? null);
        toast.success("Session revoked");
      }
    } catch {
      toast.error("Failed to revoke session");
    } finally {
      setRevoking(null);
    }
  }

  async function handleRevokeOthers() {
    setRevokingAll(true);
    try {
      const res = await authClient.revokeSessions();
      if (res.error) {
        toast.error(res.error.message ?? "Failed to revoke sessions");
      } else {
        toast.success("All other sessions revoked");
        await loadSessions();
      }
    } catch {
      toast.error("Failed to revoke sessions");
    } finally {
      setRevokingAll(false);
    }
  }

  if (sessions === null) {
    return (
      <div className="flex flex-col gap-4 bg-cream-100 dark:bg-plum-900/40 border border-cream-200 dark:border-plum-700/40 rounded-2xl p-6">
        <p className="text-sm text-ink-500 dark:text-cream-200/60">
          View and manage all active sessions for your account.
        </p>
        <Button onClick={loadSessions} disabled={loading} className="self-start">
          {loading ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null}
          {loading ? "Loading…" : "Load sessions"}
        </Button>
      </div>
    );
  }

  const currentToken = sessionData?.session?.token;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500 dark:text-cream-200/60">
          {sessions.length} active session(s)
        </p>
        <Button
          variant="outline"
          onClick={handleRevokeOthers}
          disabled={revokingAll}
          className="text-xs px-4"
        >
          {revokingAll ? <Loader2 size={12} className="animate-spin mr-1" /> : null}
          Revoke all others
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {sessions.map((s) => {
          const isCurrent = s.token === currentToken;
          return (
            <div
              key={s.id}
              className="flex items-start gap-3 rounded-2xl bg-cream-100 dark:bg-plum-900/40 border border-cream-200 dark:border-plum-700/40 px-4 py-3.5"
            >
              <div className="w-9 h-9 rounded-xl bg-plum-100 dark:bg-plum-800/50 flex items-center justify-center shrink-0">
                <Monitor size={15} className="text-plum-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-900 dark:text-cream-50">
                  {parseAgent(s.userAgent)}
                  {isCurrent && (
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wider bg-plum-100 dark:bg-plum-700/50 text-plum-700 dark:text-cream-50 px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </p>
                <p className="text-xs text-ink-500 dark:text-cream-200/60 mt-1">
                  {s.ipAddress ? `IP: ${s.ipAddress} · ` : ""}
                  Created {formatDate(s.createdAt)}
                </p>
                <p className="text-xs text-ink-500 dark:text-cream-200/60">
                  Expires {formatDate(s.expiresAt)}
                </p>
              </div>
              {!isCurrent && (
                <button
                  onClick={() => handleRevoke(s.token)}
                  disabled={revoking === s.token}
                  className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 disabled:opacity-50 shrink-0 transition"
                  title="Revoke session"
                >
                  {revoking === s.token
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Trash2 size={14} />}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
