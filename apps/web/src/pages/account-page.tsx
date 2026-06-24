import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useApiKeys, type ProviderName } from "@/features/ai/use-api-keys";
import type { ApiKeys } from "@/features/ai/use-api-keys";
import { ProfileTab } from "@/features/account/profile-tab";
import { SessionsTab } from "@/features/account/sessions-tab";
import { DangerZoneTab } from "@/features/account/danger-zone-tab";

// ── API Keys tab (extracted from original account-page) ──────────────────────

const PROVIDER_MODELS: Record<ProviderName, string[]> = {
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
  anthropic: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"],
  deepseek: ["deepseek-chat", "deepseek-reasoner"],
};

const PROVIDER_LABELS: Record<ProviderName, { name: string; docsUrl: string; placeholder: string }> = {
  openai: { name: "OpenAI", docsUrl: "https://platform.openai.com/api-keys", placeholder: "sk-..." },
  anthropic: { name: "Anthropic", docsUrl: "https://console.anthropic.com/settings/keys", placeholder: "sk-ant-..." },
  deepseek: { name: "DeepSeek", docsUrl: "https://platform.deepseek.com/api_keys", placeholder: "sk-..." },
};

function ProviderKeyField({
  provider,
  value,
  onChange,
}: {
  provider: ProviderName;
  value: string;
  onChange: (v: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [testing, setTesting] = useState(false);
  const meta = PROVIDER_LABELS[provider];

  async function testConnection() {
    if (!value.trim()) { toast.error("Enter a key first"); return; }
    setTesting(true);
    try {
      const endpoints: Record<ProviderName, () => Promise<Response>> = {
        openai: () => fetch("https://api.openai.com/v1/models", { headers: { Authorization: `Bearer ${value}` } }),
        anthropic: () => fetch("https://api.anthropic.com/v1/models", {
          headers: { "x-api-key": value, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        }),
        deepseek: () => fetch("https://api.deepseek.com/models", { headers: { Authorization: `Bearer ${value}` } }),
      };
      const res = await endpoints[provider]();
      if (res.ok) toast.success(`${meta.name} key is valid`);
      else if (res.status === 401) toast.error("Invalid API key");
      else toast.error(`Unexpected response: ${res.status}`);
    } catch {
      toast.error("Connection failed — check network");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{meta.name}</label>
        <a href={meta.docsUrl} target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:text-slate-600 underline">Get key</a>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type={visible ? "text" : "password"}
            placeholder={meta.placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pr-9"
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {visible ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <Button type="button" variant="outline" className="shrink-0 text-xs px-3" onClick={testConnection} disabled={testing || !value.trim()}>
          {testing ? "Testing…" : "Test"}
        </Button>
      </div>
    </div>
  );
}

function ApiKeysTab() {
  const { keys, updateKeys } = useApiKeys();
  const [openaiKey, setOpenaiKey] = useState(keys.openai ?? "");
  const [anthropicKey, setAnthropicKey] = useState(keys.anthropic ?? "");
  const [deepseekKey, setDeepseekKey] = useState(keys.deepseek ?? "");
  const [defaultProvider, setDefaultProvider] = useState<ProviderName>(keys.defaultProvider);
  const [defaultModel, setDefaultModel] = useState(keys.defaultModel);

  function handleProviderChange(p: ProviderName) {
    setDefaultProvider(p);
    setDefaultModel(PROVIDER_MODELS[p][0] ?? "gpt-4o");
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const updates: Partial<ApiKeys> = { defaultProvider, defaultModel };
    if (openaiKey.trim()) updates.openai = openaiKey.trim();
    if (anthropicKey.trim()) updates.anthropic = anthropicKey.trim();
    if (deepseekKey.trim()) updates.deepseek = deepseekKey.trim();
    updateKeys(updates);
    toast.success("Settings saved");
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-lg">
      <div className="flex gap-2 items-start rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-300">
        <AlertTriangle size={13} className="shrink-0 mt-0.5" />
        <span>
          Keys are stored in browser <strong>localStorage</strong> as plain text.
          Treat as dev/personal use only — do not use production-tier keys.
        </span>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-5 flex flex-col gap-5">
        <ProviderKeyField provider="openai" value={openaiKey} onChange={setOpenaiKey} />
        <ProviderKeyField provider="anthropic" value={anthropicKey} onChange={setAnthropicKey} />
        <ProviderKeyField provider="deepseek" value={deepseekKey} onChange={setDeepseekKey} />
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-5 flex flex-col gap-4">
        <h2 className="text-sm font-medium text-slate-700 dark:text-slate-300">Defaults</h2>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-slate-600 dark:text-slate-400">Default provider</label>
          <Select value={defaultProvider} onChange={(e) => handleProviderChange(e.target.value as ProviderName)}>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="deepseek">DeepSeek</option>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-slate-600 dark:text-slate-400">Default model</label>
          <Select value={defaultModel} onChange={(e) => setDefaultModel(e.target.value)}>
            {PROVIDER_MODELS[defaultProvider].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </Select>
        </div>
      </div>
      <Button type="submit" className="self-end px-6">Save settings</Button>
    </form>
  );
}

// ── Tab layout ────────────────────────────────────────────────────────────────

type TabId = "profile" | "api-keys" | "sessions" | "danger";

const TABS: { id: TabId; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "api-keys", label: "API Keys" },
  { id: "sessions", label: "Sessions" },
  { id: "danger", label: "Danger" },
];

export function AccountPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") as TabId | null;
  const activeTab: TabId = TABS.some((t) => t.id === tabParam) ? (tabParam as TabId) : "profile";

  function selectTab(id: TabId) {
    setSearchParams({ tab: id });
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <header className="h-9 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">archlet</span>
        <button
          onClick={() => navigate(-1)}
          className="text-xs px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
        >
          ← Back
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-2xl">
          <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6">Account</h1>

          {/* Tab bar */}
          <div className="flex border-b border-slate-200 dark:border-slate-700 mb-8">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => selectTab(tab.id)}
                className={`px-4 py-2 text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-slate-900 dark:border-slate-100 font-medium text-slate-900 dark:text-slate-100"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "api-keys" && <ApiKeysTab />}
          {activeTab === "sessions" && <SessionsTab />}
          {activeTab === "danger" && <DangerZoneTab />}
        </div>
      </main>
    </div>
  );
}
