import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BookingsTable } from "@/components/admin/bookings-table";
import { Button } from "@/components/ui/button";
import { getServices } from "@/core/container";
import { clampPageSize } from "@/core/domain/pagination";
import { isSupabaseConfigured } from "@/lib/env";

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function AdminBookingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.q ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  if (!isSupabaseConfigured) {
    return (
      <AdminPageHeader
        title="Bookings"
        description="Configure Supabase to manage bookings."
      />
    );
  }

  const services = getServices();
  const result = await services.bookings.list({
    page,
    pageSize: clampPageSize(10),
    sortBy: "created_at",
    sortDir: "desc",
    search: search || undefined,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Bookings"
        description="Search and manage all flight bookings."
      >
        <Button
          asChild
          className="rounded-full bg-brand-green px-6 text-white hover:bg-brand-green-hover"
        >
          <Link href="/admin/bookings/new">Create booking</Link>
        </Button>
      </AdminPageHeader>

      <BookingsTable
        bookings={result.items}
        total={result.total}
        page={result.page}
        pageCount={result.pageCount}
        search={search}
      />
    </div>
  );
}
