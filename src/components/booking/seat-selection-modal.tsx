"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { Dialog, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface SeatSelectionModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

/** Mobile-centered modal for seat selection. */
export function SeatSelectionModal({
  open,
  onClose,
  children,
  className,
}: SeatSelectionModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogPortal>
        <DialogOverlay className="z-[100] bg-black/60" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-[100] flex h-[min(92dvh,680px)] max-h-[92dvh] w-[calc(100vw-1.25rem)] max-w-md translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 md:hidden",
            className,
          )}
        >
          <DialogTitle className="sr-only">Choose seats</DialogTitle>
          <div className="flex min-h-0 flex-1 flex-col px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-4 sm:px-5">
            {children}
          </div>
          <DialogPrimitive.Close className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 opacity-100 ring-offset-background transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
