"use client";

import { motion } from "framer-motion";
import { useState, useRef } from "react";
import Image from "next/image";
import UserCounter from "./UserCounter";

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // ▶ First click: show video and start
  const handleStartVideo = async () => {
    setIsVideoOpen(true);

    requestAnimationFrame(async () => {
      if (!videoRef.current) return;
      try {
        await videoRef.current.play();
        setIsPlaying(true);
      } catch (e) {
        console.error("Video play error:", e);
      }
    });
  };

  // ⏯ Play / Pause
  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  return (
    <section
      id="hero"
      className="relative flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-32 md:py-40 min-h-screen max-w-7xl mx-auto"
    >
      {/* TEXT */}
      <div className="max-w-xl text-left mt-20 md:mt-0">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="[font-family:var(--font-heading)]  text-5xl md:text-6xl leading-tight mb-6 text-[#2b2530]"
        >
          Your Perfect
          <br />
          Conversation Partner
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-lg md:text-xl mb-10 text-[#2b2530]/80"
        >
          World&apos;s first service where you chat with a personal AI companion
          via text, voice, and video — no new apps to install.
        </motion.p>
      </div>

      {/* AVATAR / VIDEO */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="mt-16 md:mt-0 relative"
      >
        <UserCounter />

        <div className="relative">
          <div className="absolute inset-0 bg-linear-to-br from-pink-200/40 via-pink-100/30 to-purple-100/20 rounded-full blur-3xl" />

          {/* CIRCLE */}
          <div className="relative w-80 h-80 md:w-[420px] md:h-[420px] rounded-full overflow-hidden border-4 border-white/40 shadow-2xl">


              <video
                ref={videoRef}
                src="/Maite.mp4"
                playsInline
                poster="/image.png"
                disablePictureInPicture
                preload="metadata"
                onEnded={() => setIsPlaying(false)}
                className="w-full h-full object-cover object-[58%_30%]"
              />
          </div>

          {/* ▶ / ⏸ BUTTON */}
          <motion.div
            onClick={isVideoOpen ? togglePlayPause : handleStartVideo}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute bottom-8 -right-6 w-20 h-20 bg-linear-to-r from-[#ffc1d4] to-[#f55c93] rounded-full flex items-center justify-center shadow-xl cursor-pointer z-10"
          >
            {isVideoOpen && isPlaying ? (
              // Pause
              <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              // Play
              <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
