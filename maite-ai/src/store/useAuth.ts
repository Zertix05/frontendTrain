import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  pricingId: number;
  avatarId: number;
  platform: string;
  subscriptionExpiresAt: string;
  createdAt: string;
  registration_link?: string;
};

type RegisterResponse = {
  user: AuthUser;
  registration_link?: string;
};

type AuthState = {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  isLoading: boolean;


  fetchMe: () => Promise<AuthUser | null>;
  login: (input: { email: string; password: string }) => Promise<AuthUser>;
  register: (input: {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    pricingId?: number;
    avatarId?: number;
    platform?: string;
  }) => Promise<RegisterResponse>;

  updatePlan: (pricingId: number) => Promise<void>;
  updateAvatar: (avatarId: number) => Promise<void>;
  updatePlatform: (platform: string) => Promise<void>;

  logout: () => Promise<void>;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function normalizeApiUrl(url: string) {
  if (!url) return "";
  return url.endsWith("/") ? url : `${url}/`;
}

async function parseJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      isLoading: false,

      fetchMe: async () => {
        set({ isLoading: true });
        try {
          const res = await fetch("/api/auth/me", { credentials: "include" });
          const data = await parseJsonSafe(res);
          const user = (data?.user ?? null) as AuthUser | null;
          set({ user, isLoading: false });
          return user;
        } catch {
          set({ user: null, isLoading: false });
          return null;
        }
      },

      login: async ({ email, password }) => {
        set({ isLoading: true });

        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });

        const data = await parseJsonSafe(res);
        if (!res.ok || !data?.user) {
          set({ isLoading: false });
          throw new Error("LOGIN_FAILED");
        }

        set({ user: data.user, isLoading: false });
        return data.user;
      },

      register: async (input) => {
        set({ isLoading: true });

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(input),
        });

        const data = await parseJsonSafe(res);
        if (!res.ok || !data?.user) {
          set({ isLoading: false });
          const errorMessage = data?.error || data?.message || "Registration failed. Please try again.";
          throw new Error(errorMessage);
        }

        // Сохраняем пользователя с registration_link
        const userWithLink = {
          ...data.user,
          registration_link: data.registration_link,
        };

        set({ user: userWithLink, isLoading: false });

        // Возвращаем пользователя и registration_link (если есть)
        return {
          user: userWithLink,
          registration_link: data.registration_link,
        };
      },

      updatePlan: async (pricingId) => {
        const user = get().user;
        if (!user) {
          console.error("❌ No user found in store");
          return;
        }

        const url = `${normalizeApiUrl(API_URL)}v1/admin/users/${user.id}`;

        console.log("💳 Updating pricing plan:", { userId: user.id, pricingId, url });

        // 1. Обновляем на backend API
        const payload = {
          fullName: user.name,
          phoneNumber: user.phoneNumber,
          emailAddress: user.email,
          pricingId,
          avatarId: user.avatarId,
          platform: user.platform,
        };

        console.log("📤 Sending payload:", payload);

        const res = await fetch(url, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          console.log("✅ Plan updated on backend");
          const responseData = await parseJsonSafe(res);
          console.log("📡 Backend response:", responseData);
        } else {
          const errorData = await parseJsonSafe(res);
          console.error("❌ Failed to update plan on backend:", {
            status: res.status,
            statusText: res.statusText,
            error: errorData,
            url,
            payload
          });

          // Если получили 401, значит сессия истекла - очищаем пользователя
          if (res.status === 401) {
            console.log("🔒 Session expired, clearing user");
            set({ user: null });
            return;
          }
        }

        // 2. Обновляем локальные серверные данные
        try {
          const localRes = await fetch("/api/auth/update-pricing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ pricingId }),
          });

          if (localRes.ok) {
            console.log("✅ Plan updated in local server store");
          } else {
            console.error("❌ Failed to update local server store");

            // Если получили 401, значит сессия истекла - очищаем пользователя
            if (localRes.status === 401) {
              console.log("🔒 Session expired, clearing user");
              set({ user: null });
              return;
            }
          }
        } catch (e) {
          console.error("❌ Error updating local server store:", e);
        }

        // 3. Обновляем Zustand store
        const updatedUser = { ...user, pricingId };
        set({ user: updatedUser });
        console.log("💾 Updated Zustand store with new plan:", updatedUser);
      },

      // ✅ ГЛАВНОЕ: обновление аватара
      updateAvatar: async (avatarId) => {
        const user = get().user;
        if (!user) {
          console.error("❌ No user found in store");
          return;
        }

        const url = `${normalizeApiUrl(API_URL)}v1/admin/users/${user.id}`;

        console.log("🎭 Updating avatar:", { userId: user.id, avatarId, url, user });

        // 1. Обновляем на backend API
        const payload = {
          fullName: user.name,
          phoneNumber: user.phoneNumber,
          emailAddress: user.email,
          pricingId: user.pricingId,
          avatarId,
          platform: user.platform,
        };

        const res = await fetch(url, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          console.log("✅ Avatar updated on backend");
          const responseData = await parseJsonSafe(res);
          console.log("📡 Backend response:", responseData);
        } else {
          const errorData = await parseJsonSafe(res);
          console.error("❌ Failed to update avatar on backend:", {
            status: res.status,
            statusText: res.statusText,
            error: errorData
          });

          // Если получили 401, значит сессия истекла - очищаем пользователя
          if (res.status === 401) {
            console.log("🔒 Session expired, clearing user");
            set({ user: null });
            return;
          }
        }

        // 2. Обновляем локальные серверные данные
        try {
          const localRes = await fetch("/api/auth/update-avatar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ avatarId }),
          });

          if (localRes.ok) {
            console.log("✅ Avatar updated in local server store");
          } else {
            console.error("❌ Failed to update local server store");

            // Если получили 401, значит сессия истекла - очищаем пользователя
            if (localRes.status === 401) {
              console.log("🔒 Session expired, clearing user");
              set({ user: null });
              return;
            }
          }
        } catch (e) {
          console.error("❌ Error updating local server store:", e);
        }

        // 3. 🔥 Обновляем Zustand store
        const updatedUser = { ...user, avatarId };
        set({
          user: updatedUser,
        });
        console.log("💾 Updated Zustand store with new avatar:", updatedUser);
      },

      updatePlatform: async (platform) => {
        const user = get().user;
        if (!user) {
          console.error("❌ No user found in store");
          return;
        }

        const url = `${normalizeApiUrl(API_URL)}v1/admin/users/${user.id}`;

        console.log("📱 Updating platform:", { userId: user.id, platform, url });

        // 1. Обновляем на backend API
        const payload = {
          fullName: user.name,
          phoneNumber: user.phoneNumber,
          emailAddress: user.email,
          pricingId: user.pricingId,
          avatarId: user.avatarId,
          platform,
        };

        const res = await fetch(url, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          console.log("✅ Platform updated on backend");
        } else {
          console.error("❌ Failed to update platform on backend:", res.status);

          // Если получили 401, значит сессия истекла - очищаем пользователя
          if (res.status === 401) {
            console.log("🔒 Session expired, clearing user");
            set({ user: null });
            return;
          }
        }

        // 2. Обновляем локальные серверные данные
        try {
          const localRes = await fetch("/api/auth/update-platform", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ platform }),
          });

          if (localRes.ok) {
            console.log("✅ Platform updated in local server store");
          } else {
            console.error("❌ Failed to update local server store");

            // Если получили 401, значит сессия истекла - очищаем пользователя
            if (localRes.status === 401) {
              console.log("🔒 Session expired, clearing user");
              set({ user: null });
              return;
            }
          }
        } catch (e) {
          console.error("❌ Error updating local server store:", e);
        }

        // 3. Обновляем Zustand store
        const updatedUser = { ...user, platform };
        set({ user: updatedUser });
        console.log("💾 Updated Zustand store with new platform:", updatedUser);
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
          });
        } finally {
          set({ user: null, isLoading: false });
        }
      },
    }),
    {
      name: "maite_auth",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
