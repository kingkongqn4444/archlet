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
    <div className="flex flex-col gap-6 max-w-md">
      <div className="flex gap-2 items-start rounded-md border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 px-3 py-3 text-sm text-red-700 dark:text-red-300">
        <AlertTriangle size={15} className="shrink-0 mt-0.5" />
        <span>
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
        <DialogContent className="w-full max-w-sm dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle>Delete account</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Type <strong className="text-slate-800 dark:text-slate-200">{userEmail}</strong> to
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
              className="bg-red-600 hover:bg-red-700 text-white"
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
