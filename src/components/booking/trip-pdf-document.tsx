"use client";

import { forwardRef } from "react";

import type { Booking } from "@/core/domain/booking";
import { BOOKING_STATUS_LABELS } from "@/core/domain/enums";
import { APP_NAME } from "@/lib/brand";
import { formatWallClock } from "@/lib/datetime/wall-clock";
import { formatInstantDateTime } from "@/lib/format";
import { PDF_CAPTURE_WIDTH_PX } from "@/lib/tickets/download-pdf";
import type { TripDetailsData, TripItineraryItem } from "@/lib/tickets/trip-details";

interface TripPdfDocumentProps {
  trip: TripDetailsData;
  booking: Booking;
}

function PdfSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 break-inside-avoid">
      <h2 className="mb-3 border-b border-slate-200 pb-2 text-[15px] font-bold uppercase tracking-wide text-slate-800">
        {title}
      </h2>
      {children}
    </section>
  );
}

function PdfRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 text-[13px]">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}

function ItineraryPdfItems({ items }: { items: TripItineraryItem[] }) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        if (item.kind === "layover") {
          return (
            <div
              key={`layover-${item.airport}-${index}`}
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px]"
            >
              <p className="font-semibold text-amber-900">
                {item.durationLabel} layover · {item.city} ({item.airport})
              </p>
              <p className="mt-1 text-amber-800">{item.airportName}</p>
            </div>
          );
        }

        return (
          <div
            key={`segment-${item.fromAirport}-${item.toAirport}-${index}`}
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-[13px]"
          >
            <p className="font-semibold text-slate-900">
              {item.airline} {item.flightNumber} · {item.travelClass}
            </p>
            <p className="mt-1 text-slate-600">{item.aircraft}</p>
            <div className="mt-3 grid grid-cols-[1fr_auto_1fr] gap-3">
              <div>
                <p className="text-[15px] font-bold text-slate-900">
                  {formatWallClock(item.departureTime, "h:mm a")}
                </p>
                <p className="text-slate-600">{item.fromCity}</p>
                <p className="font-medium text-slate-800">{item.fromAirport}</p>
              </div>
              <div className="self-center text-center text-[12px] text-slate-500">
                {item.durationLabel}
              </div>
              <div className="text-right">
                <p className="text-[15px] font-bold text-slate-900">
                  {formatWallClock(item.arrivalTime, "h:mm a")}
                </p>
                <p className="text-slate-600">{item.toCity}</p>
                <p className="font-medium text-slate-800">{item.toAirport}</p>
              </div>
            </div>
            {item.amenities.length > 0 ? (
              <p className="mt-3 text-[12px] text-slate-500">{item.amenities.join(" · ")}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/** Print-optimised trip document for PDF export (A4 portrait, multi-page). */
export const TripPdfDocument = forwardRef<HTMLDivElement, TripPdfDocumentProps>(
  function TripPdfDocument({ trip, booking }, ref) {
    return (
      <div
        ref={ref}
        className="bg-white text-slate-900"
        style={{ width: PDF_CAPTURE_WIDTH_PX, maxWidth: PDF_CAPTURE_WIDTH_PX }}
      >
        <header className="border-b-2 border-brand-green px-8 pb-6 pt-8">
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-brand-green">
            Review your trip
          </p>
          <p className="mt-4 text-[14px] text-slate-600">Booking Code:</p>
          <p className="mt-1 font-mono text-[22px] font-bold tracking-wide text-slate-900">
            {trip.reference}
          </p>
          <div className="mt-5 space-y-1 text-[13px] text-slate-600">
            <p>Booked on {trip.bookedOnLabel}</p>
            <p>Status: {BOOKING_STATUS_LABELS[booking.status]}</p>
          </div>
          <h1 className="mt-6 text-[24px] font-bold leading-tight text-slate-900">{trip.routeTitle}</h1>
          <p className="mt-2 text-[14px] text-slate-600">{trip.departureDateLabel}</p>
        </header>

        <div className="px-8 py-6">
          <PdfSection title="Flight summary">
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 text-[13px]">
              <div>
                <p className="text-[20px] font-bold">{trip.fromAirport}</p>
                <p className="mt-1 text-slate-600">{trip.departureTimeLabel}</p>
                <p className="mt-2">{trip.departureTerminal}</p>
                <p>Gate {trip.departureGate}</p>
              </div>
              <div className="self-center text-center">
                <p className="font-medium">{trip.totalDurationLabel}</p>
                <p className="mt-1 text-slate-600">{trip.stopsLabel}</p>
                {trip.layoverSummary ? (
                  <p className="mt-1 max-w-[8rem] text-[11px] text-slate-500">{trip.layoverSummary}</p>
                ) : null}
              </div>
              <div className="text-right">
                <p className="text-[20px] font-bold">{trip.toAirport}</p>
                <p className="mt-1 text-slate-600">{trip.arrivalTimeLabel}</p>
                <p className="mt-2">{trip.arrivalTerminal}</p>
                <p>Gate {trip.arrivalGate}</p>
              </div>
            </div>
            <p className="mt-4 text-[13px] text-slate-600">
              {trip.airline} · {trip.flightNumber} · {trip.travelClass}
            </p>
          </PdfSection>

          <PdfSection title="Itinerary">
            <ItineraryPdfItems items={trip.itinerary} />
          </PdfSection>

          <PdfSection title="Baggage information">
            {trip.baggageItems.map((item) => (
              <PdfRow
                key={item.name}
                label={`${item.name} — ${item.description}`}
                value="Included"
              />
            ))}
            <p className="mt-2 text-[12px] text-slate-500">Allowance: {trip.baggageAllowance}</p>
          </PdfSection>

          <PdfSection title="Traveler">
            <PdfRow label="Passenger" value={trip.passengerName} />
            <PdfRow label="Seat" value={trip.seat} />
            <PdfRow label="Class" value={trip.travelClass} />
            {trip.email ? <PdfRow label="Email" value={trip.email} /> : null}
            {trip.phone ? <PdfRow label="Phone" value={trip.phone} /> : null}
          </PdfSection>

          {trip.billing ? (
            <PdfSection title="Billing information">
              {trip.billing.name ? <PdfRow label="Name" value={trip.billing.name} /> : null}
              {trip.billing.email ? <PdfRow label="Email" value={trip.billing.email} /> : null}
              {trip.billing.phone ? <PdfRow label="Phone" value={trip.billing.phone} /> : null}
              {trip.billing.formattedAddress ? (
                <div className="border-b border-slate-100 py-2.5 text-[13px]">
                  <p className="text-slate-500">Address</p>
                  <p className="mt-1 whitespace-pre-line font-medium text-slate-900">
                    {trip.billing.formattedAddress}
                  </p>
                </div>
              ) : null}
              {trip.billing.paymentMethod ? (
                <PdfRow label="Payment" value={trip.billing.paymentMethod} />
              ) : null}
            </PdfSection>
          ) : null}

          {trip.liveFlight && trip.liveFlight.source !== "unavailable" ? (
            <PdfSection title="Live flight status">
              <PdfRow label="Status" value={trip.liveFlight.status} />
              {trip.liveFlight.estimatedDeparture ? (
                <PdfRow
                  label="Estimated departure"
                  value={formatInstantDateTime(trip.liveFlight.estimatedDeparture)}
                />
              ) : null}
              {trip.liveFlight.estimatedArrival ? (
                <PdfRow
                  label="Estimated arrival"
                  value={formatInstantDateTime(trip.liveFlight.estimatedArrival)}
                />
              ) : null}
            </PdfSection>
          ) : null}

          <p className="mt-8 border-t border-slate-200 pt-4 text-center text-[11px] text-slate-400">
            © {new Date().getFullYear()} {APP_NAME}
          </p>
        </div>
      </div>
    );
  },
);
