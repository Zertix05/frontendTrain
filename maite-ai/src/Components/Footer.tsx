"use client";
import { Link } from "lucide-react";
import Image from "next/image";

const Footer = () => {
  const navItems = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ];

  return (
    <footer className="relative py-12 px-6 bg-linear-to-b from-[#ffeef5]/30 to-[#ffeef5]/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.svg"
            alt="Maite Logo"
            width={140}
            height={42}
            className="opacity-90"
          />
        </div>

        {/* Disclaimer */}
        <p className="text-sm text-[#2b2530]/70 max-w-2xl mx-auto mb-4 leading-relaxed [font-family:var(--font-body)]">
          Maite is not a medical or therapeutic service. If you are in crisis or need immediate help, please contact a licensed professional or local support line. We provide emotional companionship, not medical advice.
        </p>

        {/* Copyright */}
        <p className="text-sm text-[#2b2530]/60 [font-family:var(--font-body)] mb-6">
          ©2025 Maite. All rights reserved.
        </p>

        {/* Navigation */}
        <nav className="flex justify-center gap-4 [font-family:var(--font-body)]">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-base text-[#2b2530]/70 hover:text-[#f55c93] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

      </div>
    </footer>
  );
};

export default Footer;
