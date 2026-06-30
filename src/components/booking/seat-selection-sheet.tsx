"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

interface SeatSelectionSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

/** Mobile bottom sheet (~75% viewport) for seat selection. */
export function SeatSelectionSheet({
  open,
  onClose,
  children,
  className,
}: SeatSelectionSheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <motion.button
            type="button"
            aria-label="Close seat selection"
            className="absolute inset-0 bg-black/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Choose seats"
            className={cn(
              "absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-2xl bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.18)]",
              className,
            )}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 340 }}
          >
            <div className="flex shrink-0 justify-center pb-1 pt-3">
              <div className="h-1 w-10 rounded-full bg-zinc-300" aria-hidden />
            </div>
            <div className="flex min-h-0 flex-1 flex-col px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
