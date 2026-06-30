"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { DemoBookingActions } from "@/components/admin/demo-booking-actions";
import { StatusBadge } from "@/components/booking/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Booking } from "@/core/domain/booking";
import { passengerFullName, routeLabel } from "@/core/domain/booking";
import { formatDateTime } from "@/lib/format";
import { deleteBookingAction } from "@/server/actions/booking-actions";

interface BookingsTableProps {
  bookings: Booking[];
  total: number;
  page: number;
  pageCount: number;
  search: string;
}

export function BookingsTable({ bookings, total, page, pageCount, search }: BookingsTableProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(search);
  }, [search]);

  useEffect(() => {
    if (query === search) return;
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      router.push(`/admin/bookings?${params.toString()}`);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search, router]);

  function handleDelete(id: string, reference: string) {
    if (!confirm(`Delete booking ${reference}?`)) return;
    startTransition(async () => {
      const result = await deleteBookingAction(id);
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success("Booking deleted");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search by reference, name, or flight…"
          value={query}
          className="max-w-sm rounded-full border-white/20 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-brand-green"
          onChange={(e) => setQuery(e.target.value)}
        />
        <DemoBookingActions />
      </div>

      <div className="admin-panel overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-100 hover:bg-transparent">
              <TableHead className="text-zinc-500">Reference</TableHead>
              <TableHead className="text-zinc-500">Passenger</TableHead>
              <TableHead className="text-zinc-500">Route</TableHead>
              <TableHead className="text-zinc-500">Departure</TableHead>
              <TableHead className="text-zinc-500">Status</TableHead>
              <TableHead className="text-right text-zinc-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-zinc-500">
                  No bookings found.
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking.id} className="border-zinc-100">
                  <TableCell>
                    <Link
                      href={`/booking/${booking.bookingReference}`}
                      className="font-mono font-medium text-brand-green hover:underline"
                    >
                      {booking.bookingReference}
                    </Link>
                  </TableCell>
                  <TableCell className="text-zinc-800">{passengerFullName(booking)}</TableCell>
                  <TableCell className="text-zinc-500">{routeLabel(booking)}</TableCell>
                  <TableCell className="text-sm text-zinc-600">
                    {formatDateTime(booking.departureTime)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={booking.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="rounded-full border-zinc-200"
                      >
                        <Link href={`/admin/bookings/${booking.id}/edit`}>
                          <Pencil className="size-3.5" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-destructive hover:text-destructive"
                        onClick={() => handleDelete(booking.id, booking.bookingReference)}
                        disabled={pending}
                      >
                        {pending ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-white/50">
        <span>{total} booking{total !== 1 ? "s" : ""}</span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
            disabled={page <= 1}
            onClick={() => router.push(`/admin/bookings?page=${page - 1}${search ? `&q=${search}` : ""}`)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
            disabled={page >= pageCount}
            onClick={() => router.push(`/admin/bookings?page=${page + 1}${search ? `&q=${search}` : ""}`)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
