"use client";

import { ArrowLeft, Share2, Ticket } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

import { ETicketModal } from "@/components/booking/e-ticket-modal";
import { Button } from "@/components/ui/button";
import type { BoardingPassData } from "@/lib/tickets/boarding-pass";
import { cn } from "@/lib/utils";

interface BoardingPassScreenProps {
  data: BoardingPassData;
  /** Page layout with nav header; embedded fits inside the booking widget. */
  variant?: "page" | "embedded";
  backHref?: string;
  onBack?: () => void;
  className?: string;
  footer?: React.ReactNode;
}

export function BoardingPassScreen({
  data,
  variant = "page",
  backHref = "/",
  onBack,
  className,
  footer,
}: BoardingPassScreenProps) {
  const [eTicketOpen, setETicketOpen] = useState(false);

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
          <h1 className="text-base font-medium">Booking confirmed</h1>
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

        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <p className="text-sm text-white/60">Your trip is confirmed</p>
            <p className="mt-2 font-mono text-lg text-white">#{data.reference}</p>
            <p className="mt-1 text-white/80">
              {data.airline} · {data.departureAirport} → {data.arrivalAirport}
            </p>
            <p className="mt-1 text-sm text-white/50">{data.passengerName}</p>
          </div>
        </div>

        <div className={cn("mt-6 w-full max-w-md space-y-3", !isPage && "mt-4")}>
          <Button
            type="button"
            onClick={() => setETicketOpen(true)}
            className="h-12 w-full rounded-full bg-[#0055FF] text-base font-medium text-white hover:bg-[#0046E0]"
          >
            <Ticket className="mr-2 size-5" />
            View E-Ticket
          </Button>
          {footer}
        </div>
      </div>

      <ETicketModal open={eTicketOpen} onOpenChange={setETicketOpen} data={data} />
    </div>
  );
}
