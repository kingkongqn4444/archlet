import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signUp.email({ name, email, password });
      if (result.error) {
        setError(result.error.message ?? "Sign up failed");
      } else {
        toast.success("Account created");
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
        className="pointer-events-none absolute -top-40 -left-40 w-[480px] h-[480px] rounded-full bg-amber-100 dark:bg-amber-500/10 blur-3xl"
      />
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-plum-900/80 backdrop-blur border border-cream-200 dark:border-plum-700/40 shadow-float overflow-hidden">
        <div className="bg-gradient-to-br from-plum-500 via-plum-600 to-plum-800 px-7 py-6 text-cream-50">
          <Link to="/" className="inline-flex items-center gap-1 font-bold text-2xl tracking-tight">
            archlet<span className="text-amber-300">.</span>
          </Link>
          <p className="text-plum-100/80 text-sm mt-1">Start designing in 60 seconds.</p>
        </div>

        <div className="px-7 pt-6 pb-7">
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 dark:text-cream-50 mb-1">
            Create account
          </h1>
          <p className="text-sm text-ink-500 dark:text-cream-200/60 mb-6">
            Sign up with email and password
          </p>

          <Form onSubmit={handleSubmit}>
            <FormItem>
              <FormLabel htmlFor="name">Name</FormLabel>
              <Input
                id="name"
                type="text"
                required
                autoComplete="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormItem>
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
              <FormLabel htmlFor="password">Password</FormLabel>
              <Input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                minLength={8}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormItem>
            <FormMessage>{error}</FormMessage>
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
              {!loading && <Sparkles size={14} className="ml-1.5 text-amber-300" />}
            </Button>
          </Form>

          <p className="mt-6 text-center text-sm text-ink-500 dark:text-cream-200/60">
            Have an account?{" "}
            <Link to="/login" className="text-plum-500 hover:text-plum-700 dark:hover:text-plum-300 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
