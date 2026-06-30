"use client";

import { useMemo } from "react";

import { BoardingPassScreen } from "@/components/booking/boarding-pass-screen";
import type { Booking } from "@/core/domain/booking";
import { boardingPassFromBooking } from "@/lib/tickets/boarding-pass";

interface BookingBoardingPassViewProps {
  booking: Booking;
  backHref?: string;
}

export function BookingBoardingPassView({ booking, backHref = "/track" }: BookingBoardingPassViewProps) {
  const data = useMemo(() => boardingPassFromBooking(booking), [booking]);

  return <BoardingPassScreen variant="page" data={data} backHref={backHref} />;
}
