
"use client";

import { useEffect, useState } from "react";

const UserCounter = () => {
  const [current, setCurrent] = useState(0); // starting value
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    let endValue = 3000; // default value in case of error
    let startTime: number | null = null;
    const duration = 0.6; // animation duration in seconds

    const fetchUsers = async () => {
      try {
        if (!API_URL) return;

        const res = await fetch(`${API_URL}v1/admin/users/`);
        const data = await res.json();

        // Get user count from response
        endValue = data.total || 0;

        // Number animation
        const animate = (time: number) => {
          if (!startTime) startTime = time;
          const elapsed = (time - startTime) / 1000; // time in seconds
          const progress = Math.min(elapsed / duration, 1); // from 0 to 1

          const value = Math.floor(3000 + endValue * progress);
          setCurrent(value);

          if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, [API_URL]);

  return (
    <div className="absolute top-0 left-0 md:-top-12 md:-left-16 bg-linear-to-br from-pink-100/80 to-pink-200/60 backdrop-blur-sm rounded-full w-32 h-32 md:w-44 md:h-44 flex flex-col items-center justify-center shadow-lg z-10 border-2 border-white/50">
      <div className="text-center">
        <div className="text-3xl md:text-5xl font-bold text-[#2b2530]">{current}</div>
        <div className="text-base md:text-2xl text-[#f55c93] font-medium mt-1">users</div>
      </div>
    </div>
  );
};

export default UserCounter;
