import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { notFound } from "next/navigation";

import { BookingBoardingPassView } from "@/components/booking/booking-boarding-pass-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getServices } from "@/core/container";
import { normalizeBookingReference } from "@/core/services/booking-reference";
import { isSupabaseConfigured } from "@/lib/env";

// Booking details reflect live data and must always render at request time.
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ reference: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { reference } = await params;
  return {
    title: `Trip Details · ${reference}`,
    description: `Track your flight and view your e-ticket for booking ${reference}.`,
  };
}

export default async function BookingDetailsPage({ params }: PageProps) {
  const { reference: rawRef } = await params;
  const reference = normalizeBookingReference(decodeURIComponent(rawRef));

  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="container flex flex-1 items-center justify-center py-16">
          <div className="max-w-md text-center">
            <SearchX className="mx-auto size-12 text-muted-foreground" />
            <h1 className="mt-4 text-xl font-semibold">Database not configured</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Set up Supabase environment variables to enable booking lookup.
            </p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const services = getServices();
  const result = await services.tracking.track(reference);

  if (result.type === "not_found") {
    notFound();
  }

  if (result.type === "booking") {
    return (
      <BookingBoardingPassView booking={result.booking} liveFlight={result.flight} />
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="container py-10 md:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="glass rounded-2xl p-8 text-center">
            <h1 className="text-2xl font-bold">Flight status only</h1>
            <p className="mt-2 text-muted-foreground">
              No booking found for &ldquo;{reference}&rdquo;, but we found live flight data for{" "}
              {result.flight.flightNumber}.
            </p>
            <p className="mt-4 text-sm capitalize">
              Status: <strong>{result.flight.status}</strong>
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
