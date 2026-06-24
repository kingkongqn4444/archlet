import { Link } from "react-router-dom";
import {
  Sparkles,
  Layers,
  Share2,
  Code,
  Download,
  KeyRound,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI generates from text",
    desc: "Describe your system in plain language and watch the diagram build itself.",
  },
  {
    icon: Layers,
    title: "3 levels of abstraction",
    desc: "Switch between High, Mid, and Low abstraction views without losing context.",
  },
  {
    icon: Share2,
    title: "Shareable read-only links",
    desc: "Share a diagram with your team or stakeholders via a permanent link.",
  },
  {
    icon: Code,
    title: "Embed in docs (iframe)",
    desc: "Drop a live diagram into Notion, Confluence, or any iframe-enabled page.",
  },
  {
    icon: Download,
    title: "Export PNG / SVG / PDF",
    desc: "One-click exports for slides, wikis, or print.",
  },
  {
    icon: KeyRound,
    title: "BYOK — your keys, your cost",
    desc: "Use your own OpenAI, Anthropic, or DeepSeek key. We never bill for AI.",
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
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight">archlet</span>
          <div className="flex gap-2">
            <Link
              to="/login"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 mb-6">
          <Sparkles className="w-3 h-3" />
          Free forever · BYOK
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-6">
          AI-assisted system{" "}
          <span className="text-blue-600 dark:text-blue-400">
            architecture diagrams
          </span>
        </h1>
        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10">
          Design, share, and embed system designs with an AI agent that thinks
          at 3 levels of abstraction — High, Mid, and Low.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/signup"
            className={cn(buttonVariants({ size: "lg" }), "text-base px-8")}
          >
            Start free — BYOK
          </Link>
          <Link
            to="/login"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "text-base")}
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything you need to document your system
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-6"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Simple pricing</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-10">
          One plan. Free forever.
        </p>
        <div className="rounded-2xl border-2 border-blue-500 bg-white dark:bg-slate-900 p-8 shadow-xl">
          <div className="text-5xl font-extrabold mb-2">$0</div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            per month · forever
          </div>
          <ul className="text-left space-y-3 mb-8">
            {[
              "Unlimited diagrams",
              "3-level abstraction switching",
              "AI generation (BYOK)",
              "Shareable links",
              "iframe embeds",
              "PNG / SVG / PDF export",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm">
                <span className="text-blue-500 font-bold">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <Link
            to="/signup"
            className={cn(buttonVariants({ size: "lg" }), "w-full text-base")}
          >
            Get started — free forever
          </Link>
          <p className="text-xs text-slate-400 mt-3">
            Bring Your Own Key — we never charge for AI usage.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">FAQ</h2>
        <div className="space-y-4">
          {FAQS.map(({ q, a }) => (
            <details
              key={q}
              className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5"
            >
              <summary className="font-medium cursor-pointer list-none flex justify-between items-center">
                {q}
                <span className="ml-2 text-slate-400 group-open:rotate-180 transition-transform">
                  ▾
                </span>
              </summary>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-8">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <span>© {new Date().getFullYear()} Archlet. All rights reserved.</span>
          <div className="flex gap-6">
            <Link
              to="/privacy"
              className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
