import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message ?? "Login failed");
      } else {
        toast.success("Logged in");
        navigate("/d");
      }
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50 dark:bg-plum-950 px-4 relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full bg-plum-100 dark:bg-plum-700/20 blur-3xl"
      />
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-plum-900/80 backdrop-blur border border-cream-200 dark:border-plum-700/40 shadow-float overflow-hidden">
        {/* Gradient strip */}
        <div className="bg-gradient-to-br from-plum-500 via-plum-600 to-plum-800 px-7 py-6 text-cream-50">
          <Link to="/" className="inline-flex items-center gap-1 font-bold text-2xl tracking-tight">
            archlet<span className="text-amber-300">.</span>
          </Link>
          <p className="text-plum-100/80 text-sm mt-1">Welcome back.</p>
        </div>

        <div className="px-7 pt-6 pb-7">
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 dark:text-cream-50 mb-1">
            Sign in
          </h1>
          <p className="text-sm text-ink-500 dark:text-cream-200/60 mb-6">
            Enter your email and password
          </p>

          <Form onSubmit={handleSubmit}>
            <FormItem>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormItem>
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel htmlFor="password">Password</FormLabel>
                <a href="#" className="text-xs text-plum-500 hover:text-plum-700 dark:hover:text-plum-300 font-medium">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormItem>
            <FormMessage>{error}</FormMessage>
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
              {!loading && <Sparkles size={14} className="ml-1.5 text-amber-300" />}
            </Button>
          </Form>

          <p className="mt-6 text-center text-sm text-ink-500 dark:text-cream-200/60">
            No account?{" "}
            <Link to="/signup" className="text-plum-500 hover:text-plum-700 dark:hover:text-plum-300 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
