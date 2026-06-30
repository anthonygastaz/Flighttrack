import Link from "next/link";

import { APP_NAME } from "@/lib/brand";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";

export default function BookingNotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="container flex flex-1 flex-col items-center justify-center py-16">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold">Booking not found</h1>
          <p className="mt-3 text-muted-foreground">
            We couldn&apos;t find a booking with that reference. {APP_NAME} only tracks bookings
            created within this platform.
          </p>
          <Button asChild className="mt-6">
            <Link href="/track">Try another reference</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
