"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AuthModal from "./AuthModal";
import { useAuth } from "@/store/useAuth";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const navItems = [
    { label: "Home", href: "#hero" },
    { label: "Why Us", href: "#why" },
    { label: "Research", href: "#research" },
    { label: "Avatars", href: "#avatars" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();

    // Если мы на главной странице, просто прокручиваем к якорю
    if (pathname === "/") {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // Если мы на другой странице, переходим на главную с якорем
      router.push(`/${href}`);
    }
  };

  return (
    <>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl"
      >
        <div className="bg-white/80 backdrop-blur-md border-2 border-[#2b2530]/10 rounded-full shadow-sm px-6 md:px-8 py-4 flex items-center justify-between">

          {/* LOGO */}
          <a
            href="#hero"
            onClick={(e) => handleNavClick(e, "#hero")}
            className="flex items-center cursor-pointer"
          >
            <Image
              src="/logo.svg"
              alt="Maite Logo"
              width={120}
              height={36}
              className="h-9 w-auto"
            />
          </a>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden md:flex gap-10 text-[17px] font-normal [font-family:var(--font-body)]">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="text-[#2b2530] hover:text-[#f55c93] transition-colors cursor-pointer"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <motion.button
            type="button"
            onClick={() => {
              if (user) {
                router.push('/cabinet');
              } else {
                setIsAuthOpen(true);
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="hidden md:inline-block px-10 py-3 rounded-full text-white font-medium text-[16px] shadow-md bg-linear-to-r from-[#ffc1d4] to-[#f55c93]"
          >
            {user ? 'My account' : 'Sign Up'}
          </motion.button>

          {/* 🍔 BURGER BUTTON */}
          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden flex flex-col space-y-[3px] justify-center w-[25px] h-5"
          >
            <span className="block h-0.5 w-full bg-[#FF7ACC] rounded-full" />
            <span className="block h-0.5 w-full bg-[#FF7ACC] rounded-full" />
            <span className="block h-0.5 w-full bg-[#FF7ACC] rounded-full" />
          </button>
        </div>
      </motion.header>

      {/* ✅ MOBILE DROPDOWN MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-24 left-1/2 -translate-x-1/2 w-[90%] rounded-3xl bg-white shadow-2xl p-8 flex flex-col items-center gap-6"
            >
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    handleNavClick(e, item.href);
                    setIsOpen(false);
                  }}
                  className="text-[20px] text-[#2b2530] font-medium hover:text-[#f55c93] transition cursor-pointer"
                >
                  {item.label}
                </a>
              ))}

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (user) {
                    router.push('/cabinet');
                  } else {
                    setIsAuthOpen(true);
                  }
                }}
                className="mt-4 px-10 py-3 rounded-full text-white font-medium text-[16px] shadow-md bg-linear-to-r from-[#ffc1d4] to-[#f55c93]"
              >
                {user ? 'My account' : 'Sign Up'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
