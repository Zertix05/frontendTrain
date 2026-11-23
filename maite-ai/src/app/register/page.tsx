"use client";

import GlobalBackground from "@/Components/GlobalBackground";
import Header from "@/Components/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { useAuth } from "@/store/useAuth";
import { useUserFlow } from "@/store/useUserFlow";

export default function RegisterPage() {
  const router = useRouter();

  const register = useAuth((s) => s.register);
  const isLoading = useAuth((s) => s.isLoading);
  const { avatarId, pricingId, platform } = useUserFlow();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [privacyError, setPrivacyError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPhoneError(false);

    if (!privacyAccepted) {
      setPrivacyError(true);
      return;
    }

    // Validate phone is filled
    if (!phoneNumber || phoneNumber.length < 8) {
      setPhoneError(true);
      setError("Please enter a valid phone number");
      return;
    }

    // Validate password
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setPrivacyError(false);

    try {
      await register({
        name,
        email,
        phoneNumber,
        password,
        pricingId: pricingId ?? undefined,
        avatarId: avatarId ?? undefined,
        platform: platform ?? undefined
      });
      router.push("/cabinet");
    } catch (err) {
      setError(err instanceof Error ? err.message : "REGISTER_FAILED");
    }
  };

  return (
    <main className="relative overflow-hidden min-h-screen">
      <GlobalBackground />
      <Header />

      <div className="pt-32 px-4">
        <div className="max-w-md mx-auto bg-white/80 backdrop-blur-md border-2 border-[#2b2530]/10 rounded-3xl shadow-sm p-8">
          <h1 className="text-2xl font-semibold mb-2 [font-family:var(--font-heading)]">Sign Up</h1>
          <p className="text-sm text-[#2b2530]/70 mb-6">Create an account and get access to your cabinet.</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                autoComplete="name"
                className="w-full p-3 rounded-xl border border-[#2b2530]/15 bg-white"
                placeholder="Your name"
                required
              />
            </div>

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
              <label className="block text-sm mb-1">Phone *</label>
              <PhoneInput
                defaultCountry="us"
                value={phoneNumber}
                onChange={(phone) => {
                  setPhoneNumber(phone);
                  setPhoneError(false);
                }}
                placeholder="Enter phone number"
                inputClassName={`w-full p-3 rounded-xl border ${phoneError ? 'border-red-500' : 'border-[#2b2530]/15'} bg-white`}
                style={{
                  '--react-international-phone-border-radius': '0.75rem',
                  '--react-international-phone-border-color': phoneError ? '#ef4444' : 'rgba(43, 37, 48, 0.15)',
                  '--react-international-phone-background-color': 'white',
                  '--react-international-phone-height': '48px',
                } as React.CSSProperties}
              />
              {phoneError && <p className="text-red-500 text-sm mt-1">Please enter a complete phone number</p>}
            </div>

            <div>
              <label className="block text-sm mb-1">Password *</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="new-password"
                className="w-full p-3 rounded-xl border border-[#2b2530]/15 bg-white"
                placeholder="Minimum 6 characters"
                required
                minLength={6}
              />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => {
                  setPrivacyAccepted(e.target.checked);
                  setPrivacyError(false);
                }}
                className="mt-1"
              />
              <p className="text-gray-600">
                I agree with the{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  className="text-[#f55c93] underline hover:opacity-80"
                >
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a
                  href="/terms"
                  target="_blank"
                  className="text-[#f55c93] underline hover:opacity-80"
                >
                  Terms of Service
                </a>
              </p>
            </div>

            {privacyError && (
              <p className="text-red-500 text-sm">
                You must accept the privacy policy
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || !privacyAccepted}
              className="w-full py-3 rounded-full font-semibold text-white shadow-md bg-linear-to-r from-[#ffc1d4] to-[#f55c93] disabled:opacity-70"
            >
              {isLoading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-sm text-[#2b2530]/80">
            Already have an account?{" "}
            <Link href="/login" className="text-[#f55c93] underline hover:opacity-80">
              Log In
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
