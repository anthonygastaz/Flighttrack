import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BookingForm } from "@/components/admin/booking-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServices } from "@/core/container";
import { bookingToFormValues } from "@/lib/booking-form-utils";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBookingPage({ params }: PageProps) {
  const { id } = await params;

  if (!isSupabaseConfigured) notFound();

  const services = getServices();
  const booking = await services.bookings.getById(id);
  if (!booking) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Edit booking"
        description={`${booking.bookingReference} · Update passenger, flight, gate, seat, and status.`}
      >
        <Button
          asChild
          variant="outline"
          size="sm"
          className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
        >
          <Link href={`/booking/${booking.bookingReference}`} target="_blank">
            <ExternalLink className="size-4" />
            Preview
          </Link>
        </Button>
      </AdminPageHeader>
      <Card className="admin-panel border-zinc-200/80">
        <CardHeader>
          <CardTitle className="font-display text-xl font-normal text-zinc-900">
            Booking details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BookingForm
            key={booking.id}
            mode="edit"
            bookingId={booking.id}
            defaultValues={bookingToFormValues(booking)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
