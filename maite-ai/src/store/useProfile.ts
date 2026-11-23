import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserProfile = {
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  pricingId: number;
  avatarId: number;
  platform: string;
};

type ProfileState = {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  clearProfile: () => void;
};

export const useProfile = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: "maite_profile",
    }
  )
);
