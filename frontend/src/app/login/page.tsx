"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Globe2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const { username, isLoading, login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ username: "admin", password: "admin123" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && username) {
      router.replace("/hosted-zones");
    }
  }, [isLoading, username, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(form.username, form.password);
      router.push("/hosted-zones");
    } catch {
      setError("Invalid username or password. Try admin / admin123.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[var(--aws-bg)] min-h-screen px-4">
      <div className="flex items-center gap-2 mb-6 text-[var(--aws-navy)]">
        <Globe2 size={28} className="text-[var(--aws-orange)]" />
        <span className="text-xl font-semibold">Route53</span>
      </div>

      <div className="w-full max-w-sm bg-white border border-[var(--aws-border)] rounded shadow-sm p-6">
        <h1 className="text-lg font-semibold text-[var(--aws-text)] mb-1">Sign in</h1>
        <p className="text-sm text-[var(--aws-text-secondary)] mb-5">
          Mocked authentication — use the demo credentials below.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--aws-text)] mb-1">
              Username
            </label>
            <input
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              className="w-full border border-[var(--aws-border)] rounded px-3 py-2 text-sm outline-none focus:border-[var(--aws-blue)] focus:ring-1 focus:ring-[var(--aws-blue)]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--aws-text)] mb-1">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full border border-[var(--aws-border)] rounded px-3 py-2 text-sm outline-none focus:border-[var(--aws-blue)] focus:ring-1 focus:ring-[var(--aws-blue)]"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-[var(--aws-red)] bg-[var(--aws-red-bg)] border border-[var(--aws-red)]/30 rounded px-3 py-2">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" disabled={submitting} className="w-full mt-1">
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-4 text-xs text-[var(--aws-text-secondary)] border-t border-[var(--aws-border)] pt-3">
          Demo credentials: <span className="font-mono">admin</span> /{" "}
          <span className="font-mono">admin123</span>
        </div>
      </div>
    </div>
  );
}
