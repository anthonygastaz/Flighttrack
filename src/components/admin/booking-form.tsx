"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
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

  const stops = form.watch("stops") ?? 0;
  const { fields: layoverFields, replace: replaceLayovers } = useFieldArray({
    control: form.control,
    name: "layovers",
  });

  useEffect(() => {
    const current = form.getValues("layovers") ?? [];
    if (current.length === stops) return;

    if (current.length < stops) {
      const next = [...current];
      while (next.length < stops) {
        next.push({ airport: "", city: "", durationHours: 1, durationMinutes: 0 });
      }
      replaceLayovers(next);
      return;
    }

    replaceLayovers(current.slice(0, stops));
  }, [stops, form, replaceLayovers]);

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
            Booking code
          </h3>
          <FormField
            control={form.control}
            name="bookingReference"
            render={({ field }) => (
              <FormItem className="max-w-md">
                <FormLabel>
                  {mode === "edit" ? "Booking code" : "Booking code (optional)"}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    inputMode="numeric"
                    placeholder={mode === "edit" ? "13-digit booking code" : "Auto-generated if left blank"}
                    className="font-mono tracking-widest"
                    maxLength={13}
                    onChange={(event) =>
                      field.onChange(event.target.value.replace(/\D/g, "").slice(0, 13))
                    }
                  />
                </FormControl>
                <p className="text-xs text-zinc-500">
                  {mode === "edit"
                    ? "Changing this updates the code passengers use to track the booking."
                    : "Leave blank to generate a unique 13-digit code automatically."}
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

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
            Stops & layovers
          </h3>
          <FormField
            control={form.control}
            name="stops"
            render={({ field }) => (
              <FormItem className="max-w-xs">
                <FormLabel>Number of stops</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={String(field.value ?? 0)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stops" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0">Non-stop</SelectItem>
                    <SelectItem value="1">1 stop</SelectItem>
                    <SelectItem value="2">2 stops</SelectItem>
                    <SelectItem value="3">3 stops</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {stops > 0 ? (
            <div className="space-y-4">
              {layoverFields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-4"
                >
                  <p className="mb-3 text-sm font-medium text-zinc-700">Layover {index + 1}</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`layovers.${index}.airport`}
                      render={({ field: layoverField }) => (
                        <FormItem>
                          <FormLabel>Layover airport</FormLabel>
                          <FormControl>
                            <Input placeholder="DXB" className="uppercase" {...layoverField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`layovers.${index}.city`}
                      render={({ field: layoverField }) => (
                        <FormItem>
                          <FormLabel>Layover city</FormLabel>
                          <FormControl>
                            <Input placeholder="Dubai" {...layoverField} value={layoverField.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`layovers.${index}.durationHours`}
                      render={({ field: layoverField }) => (
                        <FormItem>
                          <FormLabel>Layover hours</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={48}
                              {...layoverField}
                              value={layoverField.value ?? 0}
                              onChange={(event) => layoverField.onChange(event.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`layovers.${index}.durationMinutes`}
                      render={({ field: layoverField }) => (
                        <FormItem>
                          <FormLabel>Layover minutes</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={59}
                              {...layoverField}
                              value={layoverField.value ?? 0}
                              onChange={(event) => layoverField.onChange(event.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Billing information
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="billingName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name on card" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billingEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="billing@email.com"
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
              name="billingPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 555 0100" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment method</FormLabel>
                  <FormControl>
                    <Input placeholder="Visa ending 4242" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billingAddressLine1"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Address line 1</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main Street" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billingAddressLine2"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Address line 2</FormLabel>
                  <FormControl>
                    <Input placeholder="Apt 4B" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billingCity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="London" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billingState"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State / region</FormLabel>
                  <FormControl>
                    <Input placeholder="CA" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billingPostalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal code</FormLabel>
                  <FormControl>
                    <Input placeholder="94105" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billingCountry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="United States" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Flight price details
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <Input placeholder="USD" className="uppercase" {...field} value={field.value ?? "USD"} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fareSubtotal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fare / fee subtotal</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="6040.99"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(event) => field.onChange(event.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="taxesFees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taxes &amp; fees</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="543.69"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(event) => field.onChange(event.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="totalPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="6584.68"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(event) => field.onChange(event.target.value)}
                    />
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
