"use client";

import JsBarcode from "jsbarcode";
import Image from "next/image";
import { Plane } from "lucide-react";
import { forwardRef, useEffect, useId, useRef } from "react";

import type { BoardingPassData } from "@/lib/tickets/boarding-pass";
import { airlineLogoUrl } from "@/lib/format";
import { cn } from "@/lib/utils";

interface BoardingPassTicketProps {
  data: BoardingPassData;
  className?: string;
  /** Background color behind ticket notches (page or widget bg). */
  notchColor?: string;
}

function TicketField({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-base font-semibold text-zinc-900">{value}</p>
      <p className="mt-0.5 text-xs text-zinc-400">{label}</p>
    </div>
  );
}

export const BoardingPassTicket = forwardRef<HTMLDivElement, BoardingPassTicketProps>(
  function BoardingPassTicket({ data, className, notchColor = "#051024" }, ref) {
    const barcodeId = useId().replace(/:/g, "");
    const barcodeRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
      if (!barcodeRef.current) return;
      try {
        JsBarcode(barcodeRef.current, data.ticketCode, {
          format: "CODE128",
          displayValue: false,
          height: 56,
          width: 1.6,
          margin: 0,
        });
      } catch {
        // Ignore invalid barcode payloads.
      }
    }, [data.ticketCode]);

    return (
      <div ref={ref} className={cn("w-full max-w-md", className)}>
        <div
          className="relative overflow-hidden rounded-2xl bg-white shadow-[0_8px_40px_rgba(0,0,0,0.12)]"
          style={
            {
              "--notch-color": notchColor,
            } as React.CSSProperties
          }
        >
          {/* Side notches */}
          <div
            className="pointer-events-none absolute left-0 top-[42%] z-10 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ backgroundColor: notchColor }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute right-0 top-[42%] z-10 size-5 translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ backgroundColor: notchColor }}
            aria-hidden
          />

          <div className="px-5 pb-5 pt-5 sm:px-6">
            {/* Airline header */}
            <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative size-9 shrink-0 overflow-hidden rounded-full border border-zinc-100 bg-zinc-50">
                  <Image
                    src={airlineLogoUrl(data.airlineIata, 72)}
                    alt={data.airline}
                    fill
                    className="object-contain p-1"
                    sizes="36px"
                  />
                </div>
                <p className="truncate text-sm font-semibold text-zinc-900">{data.airline}</p>
              </div>
              <p className="shrink-0 font-mono text-xs font-medium text-zinc-500">#{data.reference}</p>
            </div>

            {/* Route */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2 border-b border-zinc-100 py-5">
              <div>
                <p className="text-2xl font-bold tracking-tight text-zinc-900">{data.departureAirport}</p>
                <p className="mt-0.5 text-xs text-zinc-400">{data.departureLocation}</p>
                <p className="mt-2 text-lg font-bold text-zinc-900">{data.departureTime}</p>
              </div>

              <div className="flex flex-col items-center px-1 pt-2">
                <Plane className="size-4 rotate-90 text-[#0055FF]" />
                <div className="my-1.5 flex w-16 items-center gap-0.5">
                  <span className="h-px flex-1 border-t border-dashed border-zinc-300" />
                </div>
                <p className="text-[10px] font-medium text-zinc-500">{data.durationLabel}</p>
                <p className="text-[10px] text-zinc-400">{data.stopsLabel}</p>
                {data.layoverSummary ? (
                  <p className="mt-0.5 max-w-[7rem] text-center text-[10px] leading-tight text-zinc-400">
                    {data.layoverSummary}
                  </p>
                ) : null}
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold tracking-tight text-zinc-900">{data.arrivalAirport}</p>
                <p className="mt-0.5 text-xs text-zinc-400">{data.arrivalLocation}</p>
                <p className="mt-2 text-lg font-bold text-zinc-900">{data.arrivalTime}</p>
              </div>
            </div>

            {/* Check-in & gate */}
            <div className="grid grid-cols-2 gap-4 border-b border-zinc-100 py-4">
              <TicketField label="Check In" value={data.checkIn} />
              <TicketField label="Gate" value={data.gate} />
            </div>

            {/* Seats & terminal */}
            <div className="grid grid-cols-2 gap-4 border-b border-zinc-100 py-4">
              <TicketField label="Seats" value={data.seats} />
              <TicketField label="Terminal" value={data.terminal} />
            </div>

            {/* Class & date */}
            <div className="grid grid-cols-2 gap-4 border-b border-zinc-100 py-4">
              <TicketField label="Seat Class" value={data.travelClass} />
              <TicketField label="Date" value={data.dateLabel} />
            </div>

            {/* Passenger */}
            <div className="py-4 text-center">
              <p className="text-base font-semibold text-zinc-900">{data.passengerName}</p>
              <p className="mt-0.5 text-xs text-zinc-400">Passenger</p>
            </div>
          </div>

          {/* Barcode stub */}
          <div className="border-t border-dashed border-zinc-200 px-5 py-5 sm:px-6">
            <p className="text-center text-xs text-zinc-400">
              Ticket Code:{" "}
              <span className="font-mono font-medium text-zinc-600">{data.ticketCode}</span>
            </p>
            <div className="mt-4 flex justify-center overflow-hidden">
              <svg ref={barcodeRef} id={barcodeId} role="img" aria-label={`Barcode ${data.ticketCode}`} />
            </div>
          </div>
        </div>
      </div>
    );
  },
);
