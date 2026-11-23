"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { useAuth } from "@/store/useAuth";
import { useUserFlow } from "@/store/useUserFlow";
import { useRouter } from "next/navigation";
import CustomPopup from "./CustomPopup";



export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "login"
}: {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const login = useAuth((s) => s.login);
  const register = useAuth((s) => s.register);
  const isLoading = useAuth((s) => s.isLoading);
  const router = useRouter();
  const { avatarId, pricingId, platform } = useUserFlow();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [privacyError, setPrivacyError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [success, setSuccess] = useState(false);



  // Сбрасываем mode при открытии модалки
  useEffect(() => {
  if (isOpen) {
    setPopupMessage(
      "Maite is coming soon! Join our early access list and get 50% off your first subscription"
    );
    setPopupOpen(true);
  }
  if (!isOpen) {
    setSuccess(false);
  }
}, [isOpen, initialMode]);
useEffect(() => {
  if (!popupOpen) return;

  const t = setTimeout(() => setPopupOpen(false), 18000);
  return () => clearTimeout(t);
}, [popupOpen]);



  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setPhoneNumber("");
    setError(null);
    setPrivacyAccepted(false);
    setPrivacyError(false);
    setPhoneError(false);
  };

  const switchMode = (m: "login" | "register") => {
    setMode(m);
    resetForm();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPhoneError(false);

    // Проверка checkbox только для регистрации
    if (mode === "register" && !privacyAccepted) {
      setPrivacyError(true);
      return;
    }

    // Validate phone for registration
    if (mode === "register" && (!phoneNumber || phoneNumber.length < 8)) {
      setPhoneError(true);
      setError("Please enter a valid phone number");
      return;
    }

    setPrivacyError(false);

    try {
      let loggedInUser;
      let registrationLink: string | undefined;

      if (mode === "login") {
        loggedInUser = await login({ email, password });
      } else {
        // Validate password for registration
        if (!password || password.length < 6) {
          setError("Password must be at least 6 characters");
          return;
        }

        const registerResponse = await register({
          name,
          email,
          phoneNumber,
          password,
          pricingId: pricingId ?? undefined,
          avatarId: avatarId ?? undefined,
          platform: platform ?? undefined
        });

        loggedInUser = registerResponse.user;
        registrationLink = registerResponse.registration_link;

        setSuccess(true);
          setTimeout(() => {
            router.push("/cabinet");
          }, 3000);

          setTimeout(()=>{
           if (registrationLink) {
              window.open(registrationLink, "_blank");
            }},8000);
           
         

          return; // ⛔ КРИТИЧЕСКИ ВАЖНО
      }
    
    } catch (err) {
     setError(err instanceof Error ? err.message : "INPUT CORRECT DATA");

    }
  };

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-md p-8 relative"
          >
            {success ? (
  <div className="flex flex-col items-center text-center py-10">
    {/* Иконка отправки */}
    <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center mb-6">
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="text-4xl"
      >
        ✈️
      </motion.span>
    </div>

    <h2 className="text-2xl font-semibold mb-3">
      Data sent successfully
    </h2>

    <p className="text-[#2b2530]/70 max-w-sm">
      You will receive a <span className="font-semibold text-[#f55c93]">50% discount</span>,  
      and our manager will contact you shortly.
    </p>

    <button
      onClick={onClose}
      className="mt-8 px-6 py-3 rounded-full bg-linear-to-r from-[#ffc1d4] to-[#f55c93] text-white font-semibold shadow-md"
    >
      Got it
    </button>
  </div>
) : (
  <>
    <button
              onClick={onClose}
              className="absolute top-3 right-3 text-2xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-semibold mb-2 [font-family:var(--font-heading)]">
              {mode === "login" ? "Log In" : "Sign Up"}
            </h2>
            <p className="text-sm text-[#2b2530]/70 mb-6">
              {mode === "login"
                ? "Enter your email and password to access your account."
                : "Create an account and get access to your cabinet."}
            </p>

            <form onSubmit={onSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="block text-sm mb-1">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    autoComplete="name"
                    className="w-full p-3 rounded-xl border border-[#2b2530]/15 bg-white"
                    placeholder="Your name"
                    required={mode === "register"}
                  />
                </div>
              )}

              {mode === "register" && (
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
              )}

              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete={mode === "login" ? "email" : "email"}
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
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="w-full p-3 rounded-xl border border-[#2b2530]/15 bg-white"
                  placeholder={mode === "login" ? "••••••••" : "Minimum 6 characters"}
                  required
                  minLength={mode === "register" ? 6 : undefined}
                />
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              {mode === "register" && (
                <>
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
                </>
              )}

              <button
                type="submit"
                disabled={isLoading || (mode === "register" && !privacyAccepted)}
                className="w-full py-3 rounded-full font-semibold text-white shadow-md bg-linear-to-r from-[#ffc1d4] to-[#f55c93] disabled:opacity-70"
              >
                {isLoading
                  ? mode === "login"
                    ? "Logging in..."
                    : "Creating..."
                  : mode === "login"
                  ? "Log In"
                  : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-sm text-[#2b2530]/80">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("register")}
                    className="text-[#f55c93] underline hover:opacity-80"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="text-[#f55c93] underline hover:opacity-80"
                  >
                    Log In
                  </button>
                </>
              )}
            </div>
  </>
)}

            
          </motion.div>
        </div>
      )}
      
    </AnimatePresence>
    <CustomPopup
        isOpen={popupOpen}
        onClose={() => setPopupOpen(false)}
        message={popupMessage}
      />
    </>
  );
}
