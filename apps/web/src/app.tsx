import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthGuard } from "@/components/auth-guard";
import { ErrorBoundary } from "@/components/error-boundary";
import { CookieConsent } from "@/components/cookie-consent";
import { LandingPage } from "@/pages/landing-page";
import { NotFoundPage } from "@/pages/not-found-page";

// Eagerly loaded: auth pages are lightweight
import { LoginPage } from "@/pages/login-page";
import { SignupPage } from "@/pages/signup-page";

// Lazy-loaded: heavy routes
const WorkspacePage = lazy(() =>
  import("@/pages/workspace-page").then((m) => ({ default: m.WorkspacePage })),
);
const CanvasPage = lazy(() =>
  import("@/pages/canvas-page").then((m) => ({ default: m.CanvasPage })),
);
const AccountPage = lazy(() =>
  import("@/pages/account-page").then((m) => ({ default: m.AccountPage })),
);
const SharedPage = lazy(() =>
  import("@/pages/shared-page").then((m) => ({ default: m.SharedPage })),
);
const EmbedPage = lazy(() =>
  import("@/pages/embed-page").then((m) => ({ default: m.EmbedPage })),
);

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50 dark:bg-plum-950">
      <div className="w-7 h-7 rounded-full border-2 border-plum-500 border-t-transparent animate-spin" />
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster />
        <CookieConsent />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public share/embed routes */}
            <Route path="/s/:token" element={<SharedPage />} />
            <Route path="/e/:id" element={<EmbedPage />} />

            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route
              path="/d"
              element={
                <AuthGuard>
                  <WorkspacePage />
                </AuthGuard>
              }
            />
            <Route
              path="/d/:id"
              element={
                <AuthGuard>
                  <CanvasPage />
                </AuthGuard>
              }
            />
            <Route
              path="/account"
              element={
                <AuthGuard>
                  <AccountPage />
                </AuthGuard>
              }
            />
            <Route
              path="/account/keys"
              element={<Navigate to="/account?tab=api-keys" replace />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
