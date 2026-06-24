import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { authClient, signOut, useSession } from "@/lib/auth-client";

export function DangerZoneTab() {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleting, setDeleting] = useState(false);

  const userEmail = session?.user.email ?? "";

  async function handleDelete() {
    if (confirmEmail.trim() !== userEmail) {
      toast.error("Email does not match");
      return;
    }
    setDeleting(true);
    try {
      const res = await authClient.deleteUser();
      if (res.error) {
        toast.error(res.error.message ?? "Failed to delete account");
        setDeleting(false);
        return;
      }
      await signOut();
      toast.success("Account deleted");
      navigate("/");
    } catch {
      toast.error("Failed to delete account");
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-3 items-start rounded-2xl border-2 border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-500/40 px-4 py-4 text-sm text-red-700 dark:text-red-300">
        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          Deleting your account is <strong>permanent and irreversible</strong>. All projects,
          diagrams, and data will be removed immediately.
        </span>
      </div>

      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="self-start border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        Delete account
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete account</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-ink-700 dark:text-cream-100 mb-4">
            Type <strong className="text-ink-900 dark:text-cream-50 font-mono">{userEmail}</strong> to
            confirm deletion.
          </p>
          <Input
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            placeholder={userEmail}
            className="mb-4"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting || confirmEmail.trim() !== userEmail}
              variant="destructive"
            >
              {deleting ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null}
              {deleting ? "Deleting…" : "Delete forever"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
