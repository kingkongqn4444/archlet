import { Link } from "react-router-dom";
import {
  Sparkles,
  Layers,
  Share2,
  Code,
  Download,
  KeyRound,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI generates from text",
    desc: "Describe your system in plain language and watch the diagram build itself.",
    accent: "bg-plum-100 text-plum-600",
  },
  {
    icon: Layers,
    title: "3 levels of abstraction",
    desc: "Switch between High, Mid, and Low abstraction views without losing context.",
    accent: "bg-amber-100 text-amber-600",
  },
  {
    icon: Share2,
    title: "Shareable read-only links",
    desc: "Share a diagram with your team or stakeholders via a permanent link.",
    accent: "bg-rose-100 text-rose-600",
  },
  {
    icon: Code,
    title: "Embed in docs (iframe)",
    desc: "Drop a live diagram into Notion, Confluence, or any iframe-enabled page.",
    accent: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: Download,
    title: "Export PNG / SVG / PDF",
    desc: "One-click exports for slides, wikis, or print.",
    accent: "bg-cyan-100 text-cyan-600",
  },
  {
    icon: KeyRound,
    title: "BYOK — your keys, your cost",
    desc: "Use your own OpenAI, Anthropic, or DeepSeek key. We never bill for AI.",
    accent: "bg-violet-100 text-violet-600",
  },
];

const FAQS = [
  {
    q: "Why BYOK?",
    a: "We want you to control your AI spend. Bring your own key from OpenAI, Anthropic, or DeepSeek — it's stored only in your browser.",
  },
  {
    q: "Which AI providers are supported?",
    a: "OpenAI (GPT-4o), Anthropic (Claude 3.5+), and DeepSeek. More coming.",
  },
  {
    q: "Is my diagram data private?",
    a: "Diagrams are stored on our servers but only accessible by you (and people you share a link with). AI prompts go directly from your browser to your chosen provider.",
  },
  {
    q: "What does it cost?",
    a: "Archlet is free forever. You only pay your AI provider's API bill.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-cream-50 dark:bg-plum-950 text-ink-900 dark:text-cream-50 selection:bg-plum-200">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-cream-200/70 dark:border-plum-700/30 bg-cream-50/80 dark:bg-plum-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <span className="font-bold text-xl tracking-tight">
            archlet<span className="text-plum-500">.</span>
          </span>
          <div className="flex gap-2 items-center">
            <Link
              to="/login"
              className="h-10 px-4 inline-flex items-center text-sm font-semibold text-ink-700 dark:text-cream-100 hover:text-plum-700 dark:hover:text-plum-300 transition"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="h-10 px-5 inline-flex items-center rounded-full bg-plum-900 text-cream-50 text-sm font-semibold tracking-tight hover:bg-plum-700 hover:scale-[1.02] transition-all duration-150 shadow-soft"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Radial blob */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -right-24 w-[640px] h-[640px] rounded-full bg-plum-100 dark:bg-plum-700/20 blur-3xl opacity-70"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -left-20 w-[520px] h-[520px] rounded-full bg-amber-100 dark:bg-amber-500/10 blur-3xl opacity-60"
        />

        <div className="relative max-w-5xl mx-auto px-5 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-plum-900/60 border border-cream-200 dark:border-plum-700/40 px-3 py-1.5 text-xs font-semibold text-plum-700 dark:text-plum-200 mb-7 shadow-soft">
            <Sparkles size={11} className="text-amber-500" />
            Free forever — bring your own AI key
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
            Architecture diagrams<br />
            that{" "}
            <span className="relative inline-block">
              <span className="relative z-10 italic font-serif">think</span>
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-1 h-3 bg-amber-300/70 dark:bg-amber-500/40 -z-0 rounded"
              />
            </span>
            .
          </h1>
          <p className="text-lg sm:text-xl text-ink-500 dark:text-cream-200/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Design, share, and embed system diagrams with an AI agent that thinks at
            3 levels of abstraction — High, Mid, and Low.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-plum-900 text-cream-50 text-base font-semibold tracking-tight hover:bg-plum-700 hover:scale-[1.02] transition-all duration-150 shadow-soft"
            >
              Start free — BYOK
              <ArrowRight size={16} />
            </Link>
            <a
              href="#"
              className="inline-flex items-center justify-center h-12 px-7 rounded-full bg-white dark:bg-plum-900/50 border border-cream-200 dark:border-plum-700/40 text-ink-900 dark:text-cream-50 text-base font-semibold tracking-tight hover:bg-cream-100 dark:hover:bg-plum-800/60 transition"
            >
              View demo
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-3">
          Everything you need to document your system
        </h2>
        <p className="text-ink-500 dark:text-cream-200/60 text-center max-w-xl mx-auto mb-14">
          From idea to embedded diagram in minutes. No subscriptions, no node limits.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc, accent }) => (
            <div
              key={title}
              className="rounded-2xl border border-cream-200 dark:border-plum-700/30 bg-cream-100/70 dark:bg-plum-900/30 p-6 hover:-translate-y-1 hover:shadow-card transition-all duration-200"
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${accent} dark:bg-white/5 dark:text-cream-50`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base mb-1.5 tracking-tight">{title}</h3>
              <p className="text-sm text-ink-500 dark:text-cream-200/60 leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Open Source */}
      <section className="max-w-2xl mx-auto px-5 py-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Open Source
        </h2>
        <p className="text-ink-500 dark:text-cream-200/60 mb-10">
          MIT licensed. Self-host or use ours. BYOK — bring your own AI key.
        </p>
        <div className="rounded-3xl border-2 border-plum-500 bg-plum-50 dark:bg-plum-900/40 p-10 shadow-float text-left">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-plum-500 text-cream-50 text-xl">
              ⭐
            </span>
            <div>
              <div className="text-2xl font-extrabold tracking-tight">100% free + open</div>
              <div className="text-sm text-ink-500 dark:text-cream-200/60">No accounts required to self-host. BYOK for AI features.</div>
            </div>
          </div>
          <ul className="space-y-3 mb-8">
            {[
              "Unlimited diagrams (self-hosted)",
              "3-level abstraction switching",
              "AI generation + Refactor + Hints (BYOK)",
              "235 cloud services + 50 templates + 28 chapters",
              "Shareable links + iframe embeds",
              "PNG / SVG / PDF + Terraform / K8s / Compose export",
              "Fork, modify, ship commercially (MIT)",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-ink-900 dark:text-cream-50">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-plum-500 text-cream-50 text-[10px] font-bold">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/signup"
              className="flex-1 text-center h-12 px-8 leading-[3rem] rounded-full bg-plum-900 text-cream-50 font-semibold tracking-tight hover:bg-plum-700 transition-all duration-150 shadow-soft"
            >
              Try it now
            </Link>
            <a
              href="https://github.com/YOUR_USERNAME/archlet"
              target="_blank"
              rel="noreferrer noopener"
              className="flex-1 text-center h-12 px-8 leading-[3rem] rounded-full bg-white dark:bg-plum-800 border border-plum-300 dark:border-plum-700 text-ink-900 dark:text-cream-50 font-semibold tracking-tight hover:bg-cream-50 dark:hover:bg-plum-700 transition-all duration-150"
            >
              ⭐ Star on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-10">
          FAQ
        </h2>
        <div className="space-y-3">
          {FAQS.map(({ q, a }) => (
            <details
              key={q}
              className="group rounded-2xl border border-cream-200 dark:border-plum-700/30 bg-cream-100/50 dark:bg-plum-900/30 px-5 py-4 open:bg-white dark:open:bg-plum-900/50 transition-colors"
            >
              <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-ink-900 dark:text-cream-50">
                {q}
                <span className="ml-2 text-plum-500 group-open:rotate-180 transition-transform">
                  ▾
                </span>
              </summary>
              <p className="mt-3 text-sm text-ink-500 dark:text-cream-200/70 leading-relaxed">
                {a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-plum-900 text-cream-100 mt-10">
        <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <div className="flex items-center gap-3">
            <span className="font-bold tracking-tight text-cream-50">
              archlet<span className="text-amber-300">.</span>
            </span>
            <span className="text-cream-100/60">
              © {new Date().getFullYear()} · All rights reserved.
            </span>
          </div>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-cream-100/70 hover:text-cream-50 transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-cream-100/70 hover:text-cream-50 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
