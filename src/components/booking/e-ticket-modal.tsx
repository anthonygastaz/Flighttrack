"use client";

import { toPng } from "html-to-image";
import { Download, Loader2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { BoardingPassTicket } from "@/components/booking/boarding-pass-ticket";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { APP_NAME_SLUG } from "@/lib/brand";
import { BRAND_NAVY } from "@/lib/brand-colors";
import type { BoardingPassData } from "@/lib/tickets/boarding-pass";

interface ETicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: BoardingPassData;
}

export function ETicketModal({ open, onOpenChange, data }: ETicketModalProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const downloadTicket = useCallback(async () => {
    if (!ticketRef.current || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(ticketRef.current, {
        pixelRatio: 2,
        backgroundColor: BRAND_NAVY,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `${APP_NAME_SLUG}-e-ticket-${data.reference}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(false);
    }
  }, [data.reference, downloading]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto border-0 bg-[#051024] p-4 text-white sm:rounded-2xl">
        <DialogHeader className="text-left">
          <DialogTitle className="text-white">Your E-Ticket</DialogTitle>
          <DialogDescription className="text-white/60">
            Booking {data.reference} · {data.airline}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <BoardingPassTicket ref={ticketRef} data={data} notchColor={BRAND_NAVY} />
        </div>

        <Button
          type="button"
          onClick={downloadTicket}
          disabled={downloading}
          className="h-11 w-full rounded-full bg-[#0055FF] text-white hover:bg-[#0046E0]"
        >
          {downloading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Download className="mr-2 size-4" />
              Download E-Ticket
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
