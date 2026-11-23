"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Avatar } from "../types/avatar";
import { AvatarService } from "../services/avatar.service";
import { useAuth } from "@/store/useAuth";
import { useUserFlow } from "@/store/useUserFlow";

export default  function Avatars() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const updateAvatar = useAuth((s) => s.updateAvatar);
  const user = useAuth((s) => s.user);
  const { setAvatarId } = useUserFlow();

  useEffect(() => {
    AvatarService.getAll().then(setAvatars);
  }, []);

 const handlePick = async (avatar: Avatar) => {
  console.log("🎯 Avatar picked:", { avatarId: avatar.id, avatarKey: avatar.key });
  console.log("👤 User before update:", user);

  // Всегда сохраняем выбранный аватар в userFlow (для незалогиненных пользователей)
  setAvatarId(avatar.id);

  // Если пользователь залогинен, обновляем аватар на backend
  if (user) {
    try {
      await updateAvatar(avatar.id);
      console.log("✅ Avatar update completed");
    } catch (error) {
      console.error("❌ Failed to update avatar:", error);
      // Даже если обновление не удалось, продолжаем flow
    }
  }

  // Скроллим к выбору мессенджера
  document
    .getElementById("messengers")
    ?.scrollIntoView({ behavior: "smooth" });
};


  return (
    <section
      id="avatars"
      className="relative px-6 md:px-16 py-20 md:py-32 max-w-7xl mx-auto"
    >
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="[font-family:var(--font-heading)] text-5xl md:text-6xl text-center mb-6 text-[#2b2530]"
      >
        Three Easy Steps To Begin
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-center mb-16"
      >
        <div className="inline-block bg-white/60 backdrop-blur-sm border-2 border-[#f55c93]/30 rounded-full px-8 py-4">
          <span className="text-5xl font-bold text-[#f55c93] mr-4">
            01
          </span>
          <span className="text-2xl md:text-3xl text-[#2b2530]">
            Pick Your Avatar
          </span>
        </div>
      </motion.div>

      <div className="flex flex-col items-center gap-16">
        {/* Girls - top row */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16">
          {avatars.slice(0, 3).map((avatar, index) => (
            <motion.div
              key={avatar.key}
              onClick={() => handlePick(avatar)}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer"
            >
              <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-full overflow-hidden border-4 border-white/50 shadow-2xl">
                <div
                  className={`absolute inset-0 ${
                    index === 0
                      ? "bg-gradient-to-br from-pink-200/40 to-pink-300/30"
                      : index === 1
                      ? "bg-gradient-to-br from-purple-100/30 to-pink-100/20"
                      : "bg-gradient-to-br from-rose-100/30 to-pink-200/20"
                  } blur-2xl`}
                />

                <video
                  src={avatar.previewUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  disablePictureInPicture
                  className="relative w-full h-full object-cover"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Boys - bottom row */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16">
          {avatars.slice(3, 6).map((avatar, index) => (
            <motion.div
              key={avatar.key}
              onClick={() => handlePick(avatar)}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer"
            >
              <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-full overflow-hidden border-4 border-white/50 shadow-2xl">
                <div
                  className={`absolute inset-0 ${
                    index === 0
                      ? "bg-gradient-to-br from-blue-100/30 to-cyan-100/20"
                      : index === 1
                      ? "bg-gradient-to-br from-green-100/30 to-teal-100/20"
                      : "bg-gradient-to-br from-indigo-100/30 to-blue-100/20"
                  } blur-2xl`}
                />

                <video
                  src={avatar.previewUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                   disablePictureInPicture
                  className="relative w-full h-full object-cover"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};




