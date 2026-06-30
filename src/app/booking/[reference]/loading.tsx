import { BookingDetailsSkeleton } from "@/components/booking/booking-skeleton";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookingLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="container py-10 md:py-16">
        <Skeleton className="mb-6 h-8 w-32" />
        <div className="mx-auto max-w-3xl">
          <BookingDetailsSkeleton />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
