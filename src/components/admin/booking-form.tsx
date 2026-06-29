"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOKING_SOURCES,
  BOOKING_STATUSES,
  BOOKING_STATUS_LABELS,
  TRAVEL_CLASSES,
  TRAVEL_CLASS_LABELS,
} from "@/core/domain/enums";
import {
  type BookingFormInput,
  bookingFormSchema,
} from "@/lib/validation/booking-schema";
import {
  createBookingAction,
  updateBookingAction,
} from "@/server/actions/booking-actions";

interface BookingFormProps {
  bookingId?: string;
  defaultValues: BookingFormInput;
  mode: "create" | "edit";
}

export function BookingForm({ bookingId, defaultValues, mode }: BookingFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<BookingFormInput>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues,
  });

  function onSubmit(values: BookingFormInput) {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createBookingAction(values)
          : await updateBookingAction(bookingId!, values);

      if (!result.ok) {
        if (result.error.fields) {
          Object.entries(result.error.fields).forEach(([field, messages]) => {
            form.setError(field as keyof BookingFormInput, { message: messages[0] });
          });
        }
        toast.error(result.error.message);
        return;
      }

      toast.success(
        mode === "create"
          ? `Booking created — reference ${result.data.reference}`
          : "Booking updated",
      );
      if (mode === "edit") {
        router.refresh();
      } else {
        router.push(`/admin/bookings/${result.data.id}/edit`);
        router.refresh();
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Passenger
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="passengerFirstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input placeholder="Amelia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="passengerLastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input placeholder="Carter" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="passenger@email.com"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 555 0100" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Flight
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="airline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Airline</FormLabel>
                  <FormControl>
                    <Input placeholder="British Airways" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="airlineIata"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Airline code</FormLabel>
                  <FormControl>
                    <Input placeholder="BA" className="uppercase" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="flightNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Flight number</FormLabel>
                  <FormControl>
                    <Input placeholder="BA249" className="uppercase" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="travelClass"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Travel class</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRAVEL_CLASSES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {TRAVEL_CLASS_LABELS[c]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Route
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="departureAirport"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origin airport</FormLabel>
                  <FormControl>
                    <Input placeholder="LHR" className="uppercase" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="arrivalAirport"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination airport</FormLabel>
                  <FormControl>
                    <Input placeholder="JFK" className="uppercase" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="departureCity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origin city</FormLabel>
                  <FormControl>
                    <Input placeholder="London" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="arrivalCity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination city</FormLabel>
                  <FormControl>
                    <Input placeholder="New York" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="departureTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departure time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="arrivalTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Arrival time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Details
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="departureTerminal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terminal</FormLabel>
                  <FormControl>
                    <Input placeholder="5" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="departureGate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gate</FormLabel>
                  <FormControl>
                    <Input placeholder="A12" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="seat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seat</FormLabel>
                  <FormControl>
                    <Input placeholder="12A" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="baggageAllowance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Baggage</FormLabel>
                  <FormControl>
                    <Input placeholder="1 x 23kg" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BOOKING_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {BOOKING_STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bookingSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BOOKING_SOURCES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea placeholder="Internal notes..." rows={3} {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={pending}
            className="rounded-full bg-brand-sky px-6 text-white hover:bg-brand-sky-hover"
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {mode === "create" ? "Create booking" : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-zinc-200"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
