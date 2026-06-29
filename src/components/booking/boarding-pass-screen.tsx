"use client";

import { toPng } from "html-to-image";
import { ArrowLeft, Loader2, Share2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";

import { BoardingPassTicket } from "@/components/booking/boarding-pass-ticket";
import { Button } from "@/components/ui/button";
import { APP_NAME_SLUG } from "@/lib/brand";
import type { BoardingPassData } from "@/lib/tickets/boarding-pass";
import { BRAND_NAVY } from "@/lib/brand-colors";
import { cn } from "@/lib/utils";

interface BoardingPassScreenProps {
  data: BoardingPassData;
  /** Page layout with nav header; embedded fits inside the booking widget. */
  variant?: "page" | "embedded";
  backHref?: string;
  onBack?: () => void;
  notchColor?: string;
  className?: string;
  footer?: React.ReactNode;
}

export function BoardingPassScreen({
  data,
  variant = "page",
  backHref = "/",
  onBack,
  notchColor = BRAND_NAVY,
  className,
  footer,
}: BoardingPassScreenProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const downloadETicket = useCallback(async () => {
    if (!ticketRef.current || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(ticketRef.current, {
        pixelRatio: 2,
        backgroundColor: notchColor,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `${APP_NAME_SLUG}-e-ticket-${data.reference}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(false);
    }
  }, [data.reference, downloading, notchColor]);

  const shareTicket = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : `/booking/${data.reference}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Boarding pass · ${data.reference}`,
          text: `${data.airline} ${data.departureAirport} → ${data.arrivalAirport}`,
          url,
        });
      } catch {
        // User cancelled or share unavailable.
      }
    }
  }, [data]);

  const isPage = variant === "page";

  return (
    <div
      className={cn(
        isPage ? "flex min-h-screen flex-col bg-[#051024] text-white" : "space-y-4",
        className,
      )}
    >
      {isPage && (
        <header className="flex items-center justify-between px-4 py-4 sm:px-6">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="flex size-10 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Go back"
            >
              <ArrowLeft className="size-5" />
            </button>
          ) : (
            <Link
              href={backHref}
              className="flex size-10 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Go back"
            >
              <ArrowLeft className="size-5" />
            </Link>
          )}
          <h1 className="text-base font-medium">Boarding Pass</h1>
          <button
            type="button"
            onClick={shareTicket}
            className="flex size-10 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Share boarding pass"
          >
            <Share2 className="size-5" />
          </button>
        </header>
      )}

      <div
        className={cn(
          "flex flex-1 flex-col items-center",
          isPage ? "justify-center px-4 pb-8 pt-2 sm:px-6" : "px-0",
        )}
      >
        {!isPage && (
          <p className="text-center text-sm uppercase tracking-widest text-white/60">Booking confirmed</p>
        )}

        <BoardingPassTicket ref={ticketRef} data={data} notchColor={notchColor} className="w-full" />

        <div className={cn("mt-6 w-full max-w-md space-y-3", !isPage && "mt-4")}>
          <Button
            type="button"
            onClick={downloadETicket}
            disabled={downloading}
            className="h-12 w-full rounded-full bg-[#0055FF] text-base font-medium text-white hover:bg-[#0046E0]"
          >
            {downloading ? <Loader2 className="size-5 animate-spin" /> : "Download E-Ticket"}
          </Button>
          {footer}
        </div>
      </div>
    </div>
  );
}
