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
      <div className="flex flex-col gap-4">
        <p className="text-sm text-slate-500">
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
    <div className="flex flex-col gap-4 max-w-lg">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{sessions.length} active session(s)</p>
        <Button
          variant="outline"
          onClick={handleRevokeOthers}
          disabled={revokingAll}
          className="text-xs px-3"
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
              className="flex items-start gap-3 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-3"
            >
              <Monitor size={16} className="mt-0.5 shrink-0 text-slate-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {parseAgent(s.userAgent)}
                  {isCurrent && (
                    <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded">
                      Current
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {s.ipAddress ? `IP: ${s.ipAddress} · ` : ""}
                  Created {formatDate(s.createdAt)}
                </p>
                <p className="text-xs text-slate-400">
                  Expires {formatDate(s.expiresAt)}
                </p>
              </div>
              {!isCurrent && (
                <button
                  onClick={() => handleRevoke(s.token)}
                  disabled={revoking === s.token}
                  className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 disabled:opacity-50 shrink-0"
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
