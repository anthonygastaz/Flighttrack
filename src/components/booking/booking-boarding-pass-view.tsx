"use client";

import type { Booking } from "@/core/domain/booking";
import type { FlightStatusResult } from "@/core/domain/flight";

import { BookingTripView } from "@/components/booking/booking-trip-view";

interface BookingBoardingPassViewProps {
  booking: Booking;
  liveFlight?: FlightStatusResult | null;
}

export function BookingBoardingPassView({
  booking,
  liveFlight,
}: BookingBoardingPassViewProps) {
  return <BookingTripView booking={booking} liveFlight={liveFlight} />;
}
