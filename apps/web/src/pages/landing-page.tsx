import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-slate-50">
      <h1 className="text-4xl font-bold tracking-tight">Archlet</h1>
      <p className="text-slate-500 text-lg">AI-assisted system architecture diagrams.</p>
      <div className="flex gap-3">
        <Button onClick={() => navigate("/signup")}>Get started</Button>
        <Button variant="outline" onClick={() => navigate("/login")}>Sign in</Button>
      </div>
    </div>
  );
}
