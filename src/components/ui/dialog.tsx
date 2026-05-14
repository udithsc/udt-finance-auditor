"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Dialog({ isOpen, onClose, title, children }: DialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-2 sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg glass border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[92dvh]"
          >
            <div className="flex items-center justify-between gap-3 p-4 border-b border-white/5 sm:p-6">
              <h3 className="min-w-0 truncate text-lg font-bold text-white tracking-tight sm:text-xl">{title}</h3>
              <button
                onClick={onClose}
                className="shrink-0 p-2 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[calc(92dvh-72px)] overflow-y-auto p-4 sm:p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
