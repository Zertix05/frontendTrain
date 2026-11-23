// /store/useUserFlow.ts
import { create } from "zustand";

type UserFlowStore = {
  avatarId: number | null;
  pricingId: number | null;
  platform: string | null;

  setAvatarId: (id: number) => void;
  setPricingId: (id: number) => void;
  setPlatform: (platform: string) => void;
};

export const useUserFlow = create<UserFlowStore>((set) => ({
  avatarId: null,
  pricingId: null,
  platform: null,

  setAvatarId: (id) => set({ avatarId: id }),
  setPricingId: (id) => set({ pricingId: id }),
  setPlatform: (platform) => set({ platform }),
}));
