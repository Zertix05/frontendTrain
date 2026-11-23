"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useUserFlow } from "@/store/useUserFlow";
import { useAuth } from "@/store/useAuth";
import { useState } from "react";

const Messengers = () => {
  const { setPlatform } = useUserFlow();
  const user = useAuth((s) => s.user);
  const updatePlatform = useAuth((s) => s.updatePlatform);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const messengers = [
    { name: 'Facebook', icon: '/messengers/fb.svg', scale: 'scale-150', offset: '' },
    { name: 'WhatsApp', icon: '/messengers/wa.svg', scale: 'scale-190', offset: '' },
    { name: 'Telegram', icon: '/messengers/tg.svg', scale: 'scale-110', offset: '-translate-x-1' },
  ];

  const handleClick = async (name: string) => {
    console.log("📱 Messenger selected:", name);

    let platformValue = "";
    if (name === "Telegram") {
      platformValue = "TELEGRAM";
      setPlatform("TELEGRAM");
    } else if (name === "WhatsApp") {
      platformValue = "WHATSAPP";
      setPlatform("WHATSAPP");
      setIsModalOpen(true);
    } else if (name === "Facebook") {
      platformValue = "FACEBOOK";
      setPlatform("FACEBOOK");
      setIsModalOpen(true);
    }

    // Если пользователь залогинен, обновляем платформу на backend
    if (user && platformValue) {
      try {
        await updatePlatform(platformValue);
        console.log("✅ Platform update completed");
      } catch (error) {
        console.error("❌ Failed to update platform:", error);
      }
    }

    // Скроллим к выбору плана только для Telegram
    if (name === "Telegram") {
      setTimeout(() => {
        document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };


  return (
    <>
    <section
      id="messengers"
      className="relative px-6 md:px-16 py-20 md:py-32 max-w-7xl mx-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <div className="inline-block bg-white/60 backdrop-blur-sm border-2 border-[#f55c93]/30 rounded-full px-8 py-4">
          <span className="text-5xl font-bold text-[#f55c93] mr-4">
            02
          </span>
          <span className="text-2xl md:text-3xl text-[#2b2530]">
            Choose Your Messenger
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="max-w-4xl mx-auto"
      >
       <div className="bg-gradient-to-br from-pink-100/40 to-pink-200/30 backdrop-blur-sm border-2 border-[#f55c93]/20 rounded-3xl p-12 md:p-16 shadow-lg">
  <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20">
    {messengers.map((messenger, index) => (
      <motion.div
        key={messenger.name}
        onClick={() => handleClick(messenger.name)}
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
        whileHover={{ scale: 1.1 }}
        className="cursor-pointer"
      >
      <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white shadow-lg flex items-center justify-center">
  <div className={`w-12 h-12 flex items-center justify-center ${messenger.offset}`}>
    <Image
        src={messenger.icon}
        alt={messenger.name}
        width={48}
        height={48}
        className={`object-contain ${messenger.scale}`}
    />

  </div>
</div>

      </motion.div>
    ))}
  </div>
</div>

      </motion.div>
    </section>

      </>
  );
};

export default Messengers;
