import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthGuard } from "@/components/auth-guard";
import { LandingPage } from "@/pages/landing-page";
import { LoginPage } from "@/pages/login-page";
import { SignupPage } from "@/pages/signup-page";
import { WorkspacePage } from "@/pages/workspace-page";
import { CanvasPage } from "@/pages/canvas-page";
import { AccountPage } from "@/pages/account-page";
import { SharedPage } from "@/pages/shared-page";
import { EmbedPage } from "@/pages/embed-page";

export function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        {/* Public share routes — no auth, no AppShell */}
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
          path="/account/keys"
          element={
            <AuthGuard>
              <AccountPage />
            </AuthGuard>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
