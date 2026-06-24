import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./globals.css";
import { App } from "./app";
import { queryClient } from "./lib/query-client";
import { initSentry } from "./lib/sentry-init";

// Init Sentry before rendering (NO-OP if VITE_SENTRY_DSN unset)
initSentry();

// Apply dark theme from localStorage BEFORE first paint to avoid flash
if (localStorage.getItem("archlet_theme") === "dark") {
  document.documentElement.classList.add("dark");
}

// Analytics (PostHog) is initialized lazily by CookieConsent after user consent

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
