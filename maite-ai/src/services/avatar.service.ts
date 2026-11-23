import { Avatar } from "@/types/avatar";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const FALLBACK_AVATARS: Avatar[] = [
  { id: 1, key: "Ellie",   voiceId: "voice_1", previewUrl: "/videos/avatars/Ellie.mp4" },
  { id: 2, key: "Lisa",    voiceId: "voice_2", previewUrl: "/videos/avatars/Lisa.mp4" },
  { id: 3, key: "Mellie",  voiceId: "voice_3", previewUrl: "/videos/avatars/Mellie.mp4" },
  { id: 4, key: "Michail", voiceId: "voice_4", previewUrl: "/videos/avatars/Michail.mp4" },
  { id: 5, key: "Tom",     voiceId: "voice_5", previewUrl: "/videos/avatars/Tom.mp4" },
  { id: 6, key: "Tor",     voiceId: "voice_6", previewUrl: "/videos/avatars/Tor.mp4" },
];

export const AvatarService = {
  async getAll(): Promise<Avatar[]> {
    try {
      const res = await fetch(`${API_URL}v1/admin/avatars/`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("AVATAR_FETCH_FAILED");

      const data = await res.json();
      const backendAvatars = Array.isArray(data) ? data : data.data;

      // Map backend response to frontend Avatar type
      // Use local fallback videos since backend videos return 404
      return backendAvatars.map((avatar: any) => {
        // Extract name from previewImageUrl (e.g., "/videos/avatars/Ellie.mp4" -> "Ellie")
        const urlParts = avatar.previewImageUrl?.split('/') || [];
        const fileName = urlParts[urlParts.length - 1] || '';
        const key = fileName.replace('.mp4', '');

        return {
          id: avatar.id,
          key: key,
          voiceId: avatar.voiceId,
          // Use local videos instead of backend
          previewUrl: `/videos/avatars/${key}.mp4`,
        };
      });
    } catch (error) {
      console.error('Failed to fetch avatars:', error);
      return FALLBACK_AVATARS;
    }
  },
};
