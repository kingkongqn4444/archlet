import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient, useSession } from "@/lib/auth-client";

export function ProfileTab() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user.name ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await authClient.updateUser({ name: name.trim() });
      if (res.error) {
        toast.error(res.error.message ?? "Failed to update profile");
      } else {
        toast.success("Profile updated");
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSave}
      className="flex flex-col gap-5 bg-cream-100 dark:bg-plum-900/40 border border-cream-200 dark:border-plum-700/40 rounded-2xl p-6"
    >
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-ink-700 dark:text-cream-100">
          Display name
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-ink-700 dark:text-cream-100">
          Email
        </label>
        <Input
          value={session?.user.email ?? ""}
          disabled
          className="opacity-60 cursor-not-allowed"
        />
        <p className="text-xs text-ink-500 dark:text-cream-200/60">
          Email cannot be changed in this version.
        </p>
      </div>
      <Button type="submit" disabled={saving} className="self-start px-7">
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
