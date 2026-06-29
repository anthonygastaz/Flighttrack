"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowRight,
  Briefcase,
  Clock,
  MapPin,
  Plane,
  User,
} from "lucide-react";

import { StatusBadge } from "@/components/booking/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Booking } from "@/core/domain/booking";
import { passengerFullName, routeLabel } from "@/core/domain/booking";
import { TRAVEL_CLASS_LABELS } from "@/core/domain/enums";
import type { FlightStatusResult } from "@/core/domain/flight";
import { airlineLogoUrl, formatDateTime, formatRelative } from "@/lib/format";

interface BookingDetailsCardProps {
  booking: Booking;
  liveFlight?: FlightStatusResult | null;
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-0.5 font-medium">{value}</p>
      </div>
    </div>
  );
}

export function BookingDetailsCard({ booking, liveFlight }: BookingDetailsCardProps) {
  const logoUrl = airlineLogoUrl(booking.airlineIata);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="space-y-6"
    >
      <Card className="overflow-hidden border-border/60 shadow-sm">
        <CardHeader className="border-b border-border/40 bg-muted/20 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative size-14 overflow-hidden rounded-xl border border-border/60 bg-background p-2">
                <Image
                  src={logoUrl}
                  alt={booking.airline}
                  fill
                  className="object-contain p-1"
                  sizes="56px"
                />
              </div>
              <div>
                <p className="font-mono text-sm text-muted-foreground">{booking.bookingReference}</p>
                <CardTitle className="mt-1 text-2xl">{booking.flightNumber}</CardTitle>
                <p className="text-sm text-muted-foreground">{booking.airline}</p>
              </div>
            </div>
            <StatusBadge status={booking.status} className="self-start text-sm" />
          </div>
        </CardHeader>

        <CardContent className="space-y-8 p-6 pt-8">
          {/* Route visualization */}
          <div className="relative rounded-xl border border-border/50 bg-muted/20 p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-3xl font-bold tracking-tight">{booking.departureAirport}</p>
                {booking.departureCity && (
                  <p className="text-sm text-muted-foreground">{booking.departureCity}</p>
                )}
                <p className="mt-2 font-mono text-lg">{formatDateTime(booking.departureTime)}</p>
                <p className="text-xs text-muted-foreground">{formatRelative(booking.departureTime)}</p>
              </div>

              <div className="flex flex-1 flex-col items-center px-4">
                <div className="flex w-full items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <Plane className="size-5 rotate-90 text-primary" />
                  <div className="h-px flex-1 bg-border" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{routeLabel(booking)}</p>
              </div>

              <div className="text-center sm:text-right">
                <p className="text-3xl font-bold tracking-tight">{booking.arrivalAirport}</p>
                {booking.arrivalCity && (
                  <p className="text-sm text-muted-foreground">{booking.arrivalCity}</p>
                )}
                <p className="mt-2 font-mono text-lg">{formatDateTime(booking.arrivalTime)}</p>
                <p className="text-xs text-muted-foreground">{formatRelative(booking.arrivalTime)}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <DetailRow icon={User} label="Passenger" value={passengerFullName(booking)} />
            <DetailRow
              icon={Briefcase}
              label="Class"
              value={TRAVEL_CLASS_LABELS[booking.travelClass]}
            />
            <DetailRow icon={MapPin} label="Gate" value={booking.departureGate ?? "—"} />
            <DetailRow icon={MapPin} label="Terminal" value={booking.departureTerminal ?? "—"} />
            <DetailRow icon={ArrowRight} label="Seat" value={booking.seat ?? "—"} />
            <DetailRow
              icon={Briefcase}
              label="Baggage"
              value={booking.baggageAllowance ?? "—"}
            />
          </div>

          {liveFlight && liveFlight.source !== "unavailable" && (
            <>
              <Separator />
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                  <Clock className="size-4 text-primary" />
                  Live flight status
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-normal text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {liveFlight.source === "cache" ? "Cached" : "Live"}
                  </span>
                </h3>
                <div className="grid gap-4 rounded-lg border border-border/50 bg-muted/10 p-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="mt-1 capitalize font-medium">{liveFlight.status}</p>
                  </div>
                  {liveFlight.estimatedDeparture && (
                    <div>
                      <p className="text-xs text-muted-foreground">Est. departure</p>
                      <p className="mt-1 font-medium">{formatDateTime(liveFlight.estimatedDeparture)}</p>
                    </div>
                  )}
                  {liveFlight.estimatedArrival && (
                    <div>
                      <p className="text-xs text-muted-foreground">Est. arrival</p>
                      <p className="mt-1 font-medium">{formatDateTime(liveFlight.estimatedArrival)}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
