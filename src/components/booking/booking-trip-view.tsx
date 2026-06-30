"use client";

import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import {
  Armchair,
  BaggageClaim,
  Clock3,
  CreditCard,
  Download,
  Luggage,
  Mail,
  MapPin,
  Phone,
  Plane,
  Receipt,
  Ticket,
  User,
  Wifi,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";

import { ETicketModal } from "@/components/booking/e-ticket-modal";
import { TripPdfDocument } from "@/components/booking/trip-pdf-document";
import { StatusBadge } from "@/components/booking/status-badge";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import type { Booking } from "@/core/domain/booking";
import type { FlightStatusResult } from "@/core/domain/flight";
import { APP_NAME, APP_NAME_SLUG } from "@/lib/brand";
import { airlineLogoUrl, formatDateTime } from "@/lib/format";
import { boardingPassFromBooking } from "@/lib/tickets/boarding-pass";
import { downloadElementAsPdf } from "@/lib/tickets/download-pdf";
import type { TripItineraryItem } from "@/lib/tickets/trip-details";
import { tripDetailsFromBooking } from "@/lib/tickets/trip-details";
import { cn } from "@/lib/utils";

interface BookingTripViewProps {
  booking: Booking;
  liveFlight?: FlightStatusResult | null;
}

function SectionCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm",
        className,
      )}
    >
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </section>
  );
}

function ItineraryTimeline({ items }: { items: TripItineraryItem[] }) {
  return (
    <div className="space-y-0">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        if (item.kind === "layover") {
          return (
            <div key={`layover-${item.airport}-${index}`} className="relative pl-8">
              {!isLast ? (
                <span className="absolute bottom-0 left-[11px] top-0 w-px bg-slate-200" aria-hidden />
              ) : null}
              <span className="absolute left-0 top-4 size-[22px] rounded-full border-2 border-amber-300 bg-amber-50" />
              <div className="rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-4">
                <p className="text-sm font-semibold text-amber-900">
                  {item.durationLabel} layover in {item.city}
                </p>
                <p className="mt-1 text-sm text-amber-800/80">{item.airportName}</p>
              </div>
              {!isLast ? <div className="h-5" /> : null}
            </div>
          );
        }

        return (
          <div key={`flight-${item.fromAirport}-${item.toAirport}-${index}`} className="relative pl-8">
            {!isLast ? (
              <span className="absolute bottom-0 left-[11px] top-0 w-px bg-slate-200" aria-hidden />
            ) : null}
            <span className="absolute left-0 top-5 size-[22px] rounded-full border-2 border-[#0055FF] bg-[#0055FF]/10" />

            <div className="space-y-4 pb-6">
              <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr]">
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {format(parseISO(item.departureTime), "h:mm a")}
                  </p>
                  <p className="text-sm text-slate-500">
                    {format(parseISO(item.departureTime), "MMM d")}
                  </p>
                  <p className="mt-2 font-medium text-slate-900">{item.fromCity}</p>
                  <p className="text-sm text-slate-500">{item.fromAirportName}</p>
                </div>

                <div className="flex flex-col items-center justify-center px-2 text-center">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {item.durationLabel}
                  </p>
                  <div className="my-2 flex w-20 items-center gap-1">
                    <span className="h-px flex-1 bg-slate-200" />
                    <Plane className="size-4 rotate-90 text-[#0055FF]" />
                    <span className="h-px flex-1 bg-slate-200" />
                  </div>
                  <p className="text-xs text-slate-500">Travel time</p>
                </div>

                <div className="sm:text-right">
                  <p className="text-2xl font-bold text-slate-900">
                    {format(parseISO(item.arrivalTime), "h:mm a")}
                  </p>
                  <p className="text-sm text-slate-500">
                    {format(parseISO(item.arrivalTime), "MMM d")}
                  </p>
                  <p className="mt-2 font-medium text-slate-900">{item.toCity}</p>
                  <p className="text-sm text-slate-500">{item.toAirportName}</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative size-10 overflow-hidden rounded-full border border-slate-200 bg-white">
                    <Image
                      src={airlineLogoUrl(item.airlineIata, 64)}
                      alt={item.airline}
                      fill
                      className="object-contain p-1.5"
                      sizes="40px"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {item.airline} · {item.flightNumber}
                    </p>
                    <p className="text-sm text-slate-500">
                      {item.travelClass} · {item.aircraft}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {item.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs text-slate-600 ring-1 ring-slate-200"
                    >
                      <Wifi className="size-3 text-[#0055FF]" />
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function BookingTripView({ booking, liveFlight }: BookingTripViewProps) {
  const pageRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const [eTicketOpen, setETicketOpen] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const trip = useMemo(
    () => tripDetailsFromBooking(booking, liveFlight),
    [booking, liveFlight],
  );
  const boardingPassData = useMemo(() => boardingPassFromBooking(booking), [booking]);

  async function handleDownloadPdf() {
    const target = pdfRef.current;
    if (!target || downloadingPdf) return;
    setDownloadingPdf(true);
    try {
      await downloadElementAsPdf(target, `${APP_NAME_SLUG}-trip-${trip.reference}.pdf`);
    } finally {
      setDownloadingPdf(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#051024]">
      <SiteHeader />

      <div className="border-b border-white/10 bg-[#051024]">
        <div className="container py-8 sm:py-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
          >
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#0055FF]">
                Review your trip
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {trip.routeTitle}
              </h1>
              <p className="mt-2 text-white/70">{trip.departureDateLabel}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/60">
                <span>
                  Booking code:{" "}
                  <span className="font-mono font-medium text-white">{trip.reference}</span>
                </span>
                <span aria-hidden>·</span>
                <span>Booked on {trip.bookedOnLabel}</span>
                {trip.pricing?.totalPriceLabel ? (
                  <>
                    <span aria-hidden>·</span>
                    <span className="font-medium text-white">{trip.pricing.totalPriceLabel}</span>
                  </>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={booking.status} className="text-sm" />
              <div className="relative size-14 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-2">
                <Image
                  src={airlineLogoUrl(trip.airlineIata, 96)}
                  alt={trip.airline}
                  fill
                  className="object-contain p-1.5"
                  sizes="56px"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div ref={pageRef} className="flex-1 bg-slate-100">
        <div className="container space-y-6 py-8 sm:py-10">
          <SectionCard title="Flight summary">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
              <div>
                <p className="text-3xl font-bold text-slate-900">{trip.fromAirport}</p>
                <p className="mt-1 text-sm text-slate-500">{trip.departureTimeLabel}</p>
                <p className="mt-3 text-sm text-slate-600">{trip.departureTerminal}</p>
                <p className="text-sm text-slate-600">Gate {trip.departureGate}</p>
              </div>

              <div className="flex flex-col items-center px-4 text-center">
                <p className="text-sm font-medium text-slate-700">{trip.totalDurationLabel}</p>
                <div className="my-3 flex w-full max-w-[12rem] items-center gap-2">
                  <span className="h-px flex-1 bg-slate-200" />
                  <Plane className="size-5 rotate-90 text-[#0055FF]" />
                  <span className="h-px flex-1 bg-slate-200" />
                </div>
                <p className="text-sm font-medium text-slate-900">{trip.stopsLabel}</p>
                {trip.layoverSummary ? (
                  <p className="mt-1 max-w-xs text-xs text-slate-500">{trip.layoverSummary}</p>
                ) : null}
                <p className="mt-3 text-sm text-slate-600">
                  {trip.airline} · {trip.flightNumber}
                </p>
              </div>

              <div className="lg:text-right">
                <p className="text-3xl font-bold text-slate-900">{trip.toAirport}</p>
                <p className="mt-1 text-sm text-slate-500">{trip.arrivalTimeLabel}</p>
                <p className="mt-3 text-sm text-slate-600">{trip.arrivalTerminal}</p>
                <p className="text-sm text-slate-600">Gate {trip.arrivalGate}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Itinerary">
            <ItineraryTimeline items={trip.itinerary} />
          </SectionCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Baggage information">
              <p className="mb-4 text-sm text-slate-500">
                {trip.fromAirport} → {trip.toAirport} · {trip.airline} · Cabin: {trip.travelClass}
              </p>
              <div className="space-y-3">
                {trip.baggageItems.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-start justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-9 items-center justify-center rounded-lg bg-white ring-1 ring-slate-200">
                        <Luggage className="size-4 text-[#0055FF]" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">{item.description}</p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      Included
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-400">
                Allowance: {trip.baggageAllowance}. Some airlines may charge additional baggage fees.
              </p>
            </SectionCard>

            <SectionCard title="Who&apos;s traveling?">
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                  <div className="flex size-10 items-center justify-center rounded-full bg-[#0055FF]/10">
                    <User className="size-5 text-[#0055FF]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Traveler 1
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{trip.passengerName}</p>
                    <p className="text-sm text-slate-500">Adult · {trip.travelClass}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 px-4 py-3">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Armchair className="size-4" />
                      <span className="text-xs uppercase tracking-wide">Seat</span>
                    </div>
                    <p className="mt-2 font-medium text-slate-900">{trip.seat}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 px-4 py-3">
                    <div className="flex items-center gap-2 text-slate-500">
                      <BaggageClaim className="size-4" />
                      <span className="text-xs uppercase tracking-wide">Class</span>
                    </div>
                    <p className="mt-2 font-medium text-slate-900">{trip.travelClass}</p>
                  </div>
                </div>

                {trip.email ? (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="size-4 text-slate-400" />
                    {trip.email}
                  </div>
                ) : null}
                {trip.phone ? (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="size-4 text-slate-400" />
                    {trip.phone}
                  </div>
                ) : null}
              </div>
            </SectionCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {trip.pricing ? (
              <SectionCard title={`Price details (${trip.pricing.currency})`}>
                <div className="space-y-3">
                  {trip.pricing.lines.map((line) => (
                    <div
                      key={line.label}
                      className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-white ring-1 ring-slate-200">
                          <Receipt className="size-4 text-[#0055FF]" />
                        </div>
                        <p className="font-medium text-slate-900">{line.label}</p>
                      </div>
                      <p className="font-semibold text-slate-900">{line.amountLabel}</p>
                    </div>
                  ))}
                  {trip.pricing.totalPriceLabel ? (
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-[#0055FF]/20 bg-[#0055FF]/5 px-4 py-4">
                      <p className="text-base font-semibold text-slate-900">Total price</p>
                      <p className="text-xl font-bold text-[#0055FF]">{trip.pricing.totalPriceLabel}</p>
                    </div>
                  ) : null}
                </div>
                <p className="mt-4 text-xs text-slate-400">
                  All fares are quoted in {trip.pricing.currency}. Some airlines may charge additional
                  baggage fees.
                </p>
              </SectionCard>
            ) : null}

            {trip.billing ? (
              <SectionCard title="Billing information">
                <div className="space-y-4">
                  {trip.billing.name ? (
                    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                      <div className="flex size-10 items-center justify-center rounded-full bg-[#0055FF]/10">
                        <User className="size-5 text-[#0055FF]" />
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Billing name
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">{trip.billing.name}</p>
                      </div>
                    </div>
                  ) : null}

                  {trip.billing.email ? (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="size-4 text-slate-400" />
                      {trip.billing.email}
                    </div>
                  ) : null}
                  {trip.billing.phone ? (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="size-4 text-slate-400" />
                      {trip.billing.phone}
                    </div>
                  ) : null}
                  {trip.billing.formattedAddress ? (
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" />
                      <span className="whitespace-pre-line">{trip.billing.formattedAddress}</span>
                    </div>
                  ) : null}
                  {trip.billing.paymentMethod ? (
                    <div className="flex items-center gap-2 rounded-xl border border-slate-100 px-4 py-3 text-sm text-slate-700">
                      <CreditCard className="size-4 text-[#0055FF]" />
                      {trip.billing.paymentMethod}
                    </div>
                  ) : null}
                </div>
              </SectionCard>
            ) : null}
          </div>

          {trip.liveFlight && trip.liveFlight.source !== "unavailable" ? (
            <SectionCard title="Live flight status">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock3 className="size-4" />
                    <span className="text-xs uppercase tracking-wide">Status</span>
                  </div>
                  <p className="mt-2 capitalize font-medium text-slate-900">{trip.liveFlight.status}</p>
                </div>
                {trip.liveFlight.estimatedDeparture ? (
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin className="size-4" />
                      <span className="text-xs uppercase tracking-wide">Est. departure</span>
                    </div>
                    <p className="mt-2 font-medium text-slate-900">
                      {formatDateTime(trip.liveFlight.estimatedDeparture)}
                    </p>
                  </div>
                ) : null}
                {trip.liveFlight.estimatedArrival ? (
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin className="size-4" />
                      <span className="text-xs uppercase tracking-wide">Est. arrival</span>
                    </div>
                    <p className="mt-2 font-medium text-slate-900">
                      {formatDateTime(trip.liveFlight.estimatedArrival)}
                    </p>
                  </div>
                ) : null}
              </div>
            </SectionCard>
          ) : null}

          <p className="pb-2 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} {APP_NAME}. Track your booking anytime with your reference
            number.
          </p>
        </div>
      </div>

      <div className="sticky bottom-0 z-40 border-t border-white/10 bg-[#051024]/95 backdrop-blur-xl">
        <div className="container flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/60">
            Reference <span className="font-mono text-white">{trip.reference}</span>
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
              onClick={() => setETicketOpen(true)}
            >
              <Ticket className="mr-2 size-4" />
              E-Ticket
            </Button>
            <Button
              type="button"
              disabled={downloadingPdf}
              className="h-11 rounded-full bg-[#0055FF] text-white hover:bg-[#0046E0]"
              onClick={handleDownloadPdf}
            >
              <Download className="mr-2 size-4" />
              {downloadingPdf ? "Preparing PDF…" : "Download trip PDF"}
            </Button>
          </div>
        </div>
      </div>

      <SiteFooter />

      <div className="pointer-events-none fixed left-[-10000px] top-0" aria-hidden>
        <TripPdfDocument ref={pdfRef} trip={trip} booking={booking} />
      </div>

      <ETicketModal open={eTicketOpen} onOpenChange={setETicketOpen} data={boardingPassData} />
    </div>
  );
}
