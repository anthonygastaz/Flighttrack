import type { Metadata } from "next";

import { BookingSearchBar } from "@/components/booking/booking-search-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "Track Booking",
  description: "Enter your booking reference to track your flight.",
};

export default function TrackPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center">
        <div className="container py-16">
          <div className="mx-auto max-w-xl">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight">Track your booking</h1>
              <p className="mt-3 text-muted-foreground">
                Enter your 13-digit booking reference to view your itinerary.
              </p>
            </div>
            <div className="mt-10">
              <BookingSearchBar size="large" autoFocus />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
