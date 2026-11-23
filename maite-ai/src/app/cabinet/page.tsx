"use client";

import GlobalBackground from "@/Components/GlobalBackground";
import Header from "@/Components/Header";
import { useAuth } from "@/store/useAuth";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

const planNameById: Record<number, string> = {
  1: "Basic",
  2: "Plus",
  3: "Premium",
};

const avatarNameById: Record<number, string> = {
  37: "Ellie",
  36: "Lisa",
  18: "Mellie",
  39: "Michail",
  40: "Tom",
  41: "Tor",
};

const platformNameById: Record<string, string> = {
  TELEGRAM: "Telegram",
  WHATSAPP: "WhatsApp",
  FACEBOOK: "Facebook",
};

export default function CabinetPage() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const isLoading = useAuth((s) => s.isLoading);
  const fetchMe = useAuth((s) => s.fetchMe);
  const logout = useAuth((s) => s.logout);

  useEffect(() => {
    if (!user) {
      void fetchMe();
    }
  }, [fetchMe, user]);

  // Debug: log user data when it changes
  useEffect(() => {
    if (user) {
      console.log("👤 Cabinet page - current user:", {
        id: user.id,
        name: user.name,
        avatarId: user.avatarId,
        avatarName: avatarNameById[user.avatarId],
        pricingId: user.pricingId,
        planName: planNameById[user.pricingId],
      });
    }
  }, [user]);

  const currentPlanTitle = useMemo(() => {
    if (!user) return "";
    if (!user.pricingId || user.pricingId === 0) return "Not selected";
    return planNameById[user.pricingId] ?? `#${user.pricingId}`;
  }, [user]);

  const paidUntilLabel = useMemo(() => {
    if (!user?.subscriptionExpiresAt) return null;
    const ms = Date.parse(user.subscriptionExpiresAt);
    if (!Number.isFinite(ms)) return null;
    return new Date(ms).toLocaleDateString();
  }, [user]);


  const onLogout = async () => {
    await logout();
    router.push("/");
  };

  const onChangePlan = () => {
    router.push("/#plans");
  };

  const onChangeAvatar = () => {
    router.push("/#avatars");
  };

 const onCancelSubscription = async () => {
  if (!confirm("Are you sure you want to cancel your subscription?")) return;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}v1/subscriptions/cancel`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (!res.ok) {
      throw new Error("CANCEL_FAILED");
    }

    alert("Subscription cancelled");
    await fetchMe(); // обновляем данные пользователя
  } catch (e) {
    console.error(e);
    alert("Failed to cancel subscription");
  }
};


  return (
    <main className="relative overflow-hidden min-h-screen">
      <GlobalBackground />
      <Header />

      <div className="pt-32 px-4">
        <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-md border-2 border-[#2b2530]/10 rounded-3xl shadow-sm p-8">
          <h1 className="text-2xl font-semibold mb-2 [font-family:var(--font-heading)]">Personal Cabinet</h1>

          {isLoading && !user ? (
            <p className="text-sm text-[#2b2530]/70">Loading profile...</p>
          ) : user ? (
            <div className="space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4 pb-4 border-b border-[#2b2530]/10">
                <div
                  onClick={onChangeAvatar}
                  className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#f55c93]/30 shadow-lg cursor-pointer group"
                >
                  {user.avatarId && user.avatarId !== 0 ? (
                    <>
                      <video
                        src={`/videos/avatars/${avatarNameById[user.avatarId]}.mp4`}
                        autoPlay
                        loop
                        muted
                        playsInline
                        disablePictureInPicture
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay с плюсиком при наведении */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {/* Плюсик при наведении для пустого аватара */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out flex items-center justify-center">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    </>
                  )}
                </div>
                <div>
                  <div className="text-lg font-semibold text-[#2b2530]">{(user.avatarId && avatarNameById[user.avatarId]) || "Not selected"}</div>
                  <div className="text-sm text-[#2b2530]/70">{(user.platform && user.platform !== "") ? (platformNameById[user.platform] || user.platform) : "Not selected"}</div>
                </div>
              </div>

              {/* User Information */}
              <div className="text-sm">
                <span className="text-[#2b2530]/70">Name:</span> {user.name}
              </div>
              <div className="text-sm">
                <span className="text-[#2b2530]/70">Email:</span> {user.email}
              </div>
              <div className="text-sm">
                <span className="text-[#2b2530]/70">Phone:</span> {user.phoneNumber}
              </div>
              <div className="text-sm">
                <span className="text-[#2b2530]/70">Plan:</span> {currentPlanTitle}
              </div>
              <div className="text-sm">
                <span className="text-[#2b2530]/70">Paid until:</span>{" "}
                {paidUntilLabel ?? "(backend doesn't provide subscription expiry yet)"}
              </div>

              <div className="pt-8 border-t border-[#2b2530]/10 space-y-4">
                {/* {user.registration_link && (
                  <button
                    onClick={() => window.open(user.registration_link, "_blank")}
                    className="w-full py-3 rounded-xl border-2 border-blue-400 text-blue-600 font-medium hover:bg-blue-50 transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.67-.52.36-.99.53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.48 1.03-.73 4.04-1.76 6.73-2.92 8.08-3.49 3.85-1.61 4.65-1.89 5.17-1.9.11 0 .37.03.54.17.14.12.18.28.2.41-.01.06.01.24 0 .38z"/>
                    </svg>
                    Open Telegram
                  </button>
                )} */}

                <button
                  onClick={onChangePlan}
                  className="w-full py-3 rounded-xl border-2 border-[#f55c93]/40 text-[#f55c93] font-medium hover:bg-[#f55c93]/10 transition"
                >
                  Change subscription
                </button>

                <button
                  onClick={onCancelSubscription}
                  className="w-full py-3 rounded-xl border-2 border-red-300 text-red-500 font-medium hover:bg-red-50 transition"
                >
                  Cancel subscription
                </button>

                <div className="pt-2 text-center">
                  <button
                    onClick={onLogout}
                    className="text-[#2b2530]/60 underline hover:opacity-80 text-sm"
                  >
                    Log Out
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div>
              <p className="text-sm text-[#2b2530]/70">Session not found. Redirecting to login...</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
