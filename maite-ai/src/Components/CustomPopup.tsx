"use client";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  message: string;
};

export default function CustomPopup({ isOpen, onClose, message }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999]
            w-[calc(100%-32px)] sm:w-auto
            max-w-[520px]
            bg-gradient-to-r from-pink-100 to-pink-200
            text-[#2b2530]
            px-5 py-3 sm:px-6 sm:py-4
            rounded-2xl
            shadow-2xl
            flex items-start gap-3
            border border-pink-300/40 [font-family:var(--font-body)]"
        >
          <span className="text-sm font-medium text-[#2b2530]">
            {message}
          </span>

          <button
            onClick={onClose}
            className="text-[#f55c93] hover:text-pink-700
              transition
              text-xl
              leading-none shrink-0"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
