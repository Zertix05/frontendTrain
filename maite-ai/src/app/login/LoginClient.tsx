"use client";

import GlobalBackground from "@/Components/GlobalBackground";
import Header from "@/Components/Header";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/store/useAuth";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/cabinet";

  const login = useAuth((s) => s.login);
  const isLoading = useAuth((s) => s.isLoading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login({ email, password });
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "LOGIN_FAILED");
    }
  };

  return (
    <main className="relative overflow-hidden min-h-screen">
      <GlobalBackground />
      <Header />

      <div className="pt-32 px-4">
        <div className="max-w-md mx-auto bg-white/80 backdrop-blur-md border-2 border-[#2b2530]/10 rounded-3xl shadow-sm p-8">
          <h1 className="text-2xl font-semibold mb-2 [font-family:var(--font-heading)]">
            Log In
          </h1>

          <p className="text-sm text-[#2b2530]/70 mb-6">
            Enter your email and password to access your account.
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                className="w-full p-3 rounded-xl border border-[#2b2530]/15 bg-white"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                className="w-full p-3 rounded-xl border border-[#2b2530]/15 bg-white"
                placeholder="••••••••"
                required
              />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full font-semibold text-white shadow-md bg-linear-to-r from-[#ffc1d4] to-[#f55c93] disabled:opacity-70"
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="mt-6 text-sm text-[#2b2530]/80">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-[#f55c93] underline hover:opacity-80"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
