"use client";
import { useState } from "react";
import { useUserFlow } from "@/store/useUserFlow";
import { useAuth } from "@/store/useAuth";
import { useRouter } from "next/navigation";
import CustomPopup from "./CustomPopup";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function RegistrationModal({ isOpen, onClose }: Props) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const { avatarId, pricingId, platform } = useUserFlow();
  const register = useAuth((s) => s.register);
  const router = useRouter();

  const [isSuccess, setIsSuccess] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    emailAddress: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState({
    fullName: false,
    emailAddress: false,
    phoneNumber: false,
  });

  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [privacyError, setPrivacyError] = useState(false);

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // ===== VALIDATION =====
  const validate = () => {
    const nameValid =
      form.fullName.trim().length > 1 &&
      /^[A-Za-zА-Яа-я\s]+$/.test(form.fullName);

    const emailValid =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailAddress);

   const phoneDigits = form.phoneNumber.replace(/\D/g, "");
   const phoneValid = phoneDigits.length >= 8;


    const newErrors = {
      fullName: !nameValid,
      emailAddress: !emailValid,
      phoneNumber: !phoneValid,
    };

    setErrors(newErrors);

    return nameValid && emailValid && phoneValid;
  };

  // ===== SUBMIT =====
  const handleSubmit = async () => {
  if (!validate()) return;

  if (!avatarId || !pricingId || !platform) {
    setPopupMessage("Input correct data or choose price and avatar");
    setPopupOpen(true);
    return;
  }

  if (!privacyAccepted) {
    setPrivacyError(true);
    return;
  }

  try {
    // First register through backend (if API_URL exists)
    if (API_URL) {
      const payload = {
        fullName: form.fullName,
        emailAddress: form.emailAddress,
        phoneNumber: form.phoneNumber.replace(/\D/g, ""),
        avatarId,
        pricingId,
        platform,
      };

      const res = await fetch(`${API_URL}v1/admin/users/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Backend registration failed");
    }

    // Then register locally through useAuth (for session and personal cabinet)
    // Generate a temporary password for this registration flow
    const tempPassword = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    await register({
      name: form.fullName,
      email: form.emailAddress,
      phoneNumber: form.phoneNumber.replace(/\D/g, ""),
      password: tempPassword,
      pricingId,
      avatarId,
      platform,
    });

    setIsSuccess(true);

    // After successful registration redirect to cabinet after 1.5 sec
    setTimeout(() => {
      router.push("/cabinet");
    }, 1500);

  } catch (e) {
    console.error(e);
    setPopupMessage("Error registration");
    setPopupOpen(true);
  }
};


  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl w-full max-w-md p-8 relative"
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-2xl"
          >
            ✕
          </button>

          {isSuccess ? (
            /* ===== SUCCESS ===== */
            <div className="flex flex-col items-center text-center py-12">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-bold mb-2">
                Successfully sent
              </h2>
              <p className="text-gray-500">
                We will contact you shortly
              </p>
            </div>
          ) : (
            /* ===== FORM ===== */
            <>
              <h2 className="text-2xl font-bold mb-6 text-center">
                Registration
              </h2>

              {/* FULL NAME */}
              <input
                placeholder="Full name"
                value={form.fullName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    fullName: e.target.value.replace(
                      /[^A-Za-zА-Яа-я\s]/g,
                      ""
                    ),
                  })
                }
                className={`w-full mb-1 p-3 rounded-xl border ${
                  errors.fullName ? "border-red-500" : ""
                }`}
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mb-3">
                  Enter a valid name
                </p>
              )}

              {/* EMAIL */}
              <input
                placeholder="Email"
                value={form.emailAddress}
                onChange={(e) =>
                  setForm({
                    ...form,
                    emailAddress: e.target.value,
                  })
                }
                className={`w-full mb-1 p-3 rounded-xl border ${
                  errors.emailAddress ? "border-red-500" : ""
                }`}
              />
              {errors.emailAddress && (
                <p className="text-red-500 text-sm mb-3">
                  Enter a valid email
                </p>
              )}

              {/* PHONE */}
              <PhoneInput
                defaultCountry="us"
                value={form.phoneNumber}
                onChange={(phone) =>
                  setForm({
                    ...form,
                    phoneNumber: phone,
                  })
                }
                placeholder="Enter phone number"
                inputClassName={`w-full p-3 rounded-xl border ${
                  errors.phoneNumber ? "border-red-500" : ""
                }`}
                style={{
                  '--react-international-phone-border-radius': '0.75rem',
                  '--react-international-phone-border-color': errors.phoneNumber ? '#ef4444' : 'rgba(43, 37, 48, 0.15)',
                  '--react-international-phone-background-color': 'white',
                  '--react-international-phone-height': '48px',
                } as React.CSSProperties}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mb-3">
                  Enter a valid phone number
                </p>
              )}

              {/* PRIVACY POLICY */}
              <div className="flex items-start gap-2 mb-2 text-sm">
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
                      className="text-[#f55c93] underline hover:opacity-80"
                    >
                      Privacy Policy
                    </a>{" "}
                      and{" "}
                     <a
                      href="/terms"
                      className="text-[#f55c93] underline hover:opacity-80"
                    >
                      Terms of Service
                    </a>
                  </p>
              </div>

              {privacyError && (
                <p className="text-red-500 text-sm mb-3">
                  You must accept the privacy policy
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={!privacyAccepted}
                className={`w-full py-3 rounded-full font-bold text-white transition
                  ${
                    privacyAccepted
                      ? "bg-linear-to-r from-[#ffc1d4] to-[#f55c93]"
                      : "bg-gray-300 cursor-not-allowed"
                  }
                `}
              >
                Submit
              </button>
            </>
          )}
        </div>
      </div>

      <CustomPopup
        isOpen={popupOpen}
        onClose={() => setPopupOpen(false)}
        message={popupMessage}
      />
    </>
  );
}
