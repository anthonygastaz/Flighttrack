"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftRight,
  Car,
  Hotel,
  Loader2,
  Plane,
  Search,
  User,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TRAVEL_CLASS_LABELS, TRAVEL_CLASSES } from "@/core/domain/enums";
import { AirportSearchInput } from "@/components/booking/airport-search-input";
import { AirlineSearchInput } from "@/components/booking/airline-search-input";
import { BoardingPassScreen } from "@/components/booking/boarding-pass-screen";
import { SeatSelectionModal } from "@/components/booking/seat-selection-modal";
import { SeatSelectionStep } from "@/components/booking/seat-selection-step";
import type { Booking } from "@/core/domain/booking";
import { boardingPassFromBooking } from "@/lib/tickets/boarding-pass";
import { useIsMobile } from "@/lib/hooks/use-is-mobile";
import {
  type PublicBookingInput,
  publicBookingSchema,
} from "@/lib/validation/public-booking-schema";
import { createPublicBookingAction } from "@/server/actions/public-booking-actions";
import { cn } from "@/lib/utils";

type BookingStep = "search" | "seats" | "passenger" | "confirmed";

export function FlightBookingWidget() {
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<BookingStep>("search");
  const [reference, setReference] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [activeTab, setActiveTab] = useState("flights");

  const form = useForm<PublicBookingInput>({
    resolver: zodResolver(publicBookingSchema),
    defaultValues: {
      tripType: "round-trip",
      from: "LHR",
      to: "JFK",
      departureDate: defaultDate(7),
      returnDate: defaultDate(14),
      airlineIata: "BR",
      passengerFirstName: "",
      passengerLastName: "",
      email: "",
      travelClass: "economy",
      adults: 1,
      seats: [],
    },
  });

  const tripType = form.watch("tripType");
  const travelClass = form.watch("travelClass");
  const adults = form.watch("adults");
  const selectedSeats = form.watch("seats") ?? [];
  const isMobile = useIsMobile();
  const showSeatModal = step === "seats" && isMobile;
  const formStep = step === "seats" && isMobile ? "search" : step;
  const boardingPassData = useMemo(
    () => (confirmedBooking ? boardingPassFromBooking(confirmedBooking) : null),
    [confirmedBooking],
  );

  const seatSelectionField = (
    <FormField
      control={form.control}
      name="seats"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <SeatSelectionStep
              travelClass={travelClass}
              adults={adults}
              value={field.value ?? []}
              onChange={field.onChange}
              onContinue={onSeatsContinue}
              onBack={() => setStep("search")}
              error={form.formState.errors.seats?.message}
              variant={showSeatModal ? "modal" : "default"}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );

  function onSearchStep(event: React.FormEvent) {
    event.preventDefault();
    const fields = ["from", "to", "departureDate", "returnDate", "airlineIata", "travelClass", "tripType", "adults"] as const;
    form.trigger(fields).then((valid) => {
      if (valid) {
        form.setValue("seats", []);
        setStep("seats");
      }
    });
  }

  function onSeatsContinue() {
    form.trigger("seats").then((valid) => {
      if (valid) setStep("passenger");
    });
  }

  function onBookSubmit(values: PublicBookingInput) {
    startTransition(async () => {
      const result = await createPublicBookingAction(values);
      if (!result.ok) {
        if (result.error.fields) {
          Object.entries(result.error.fields).forEach(([field, messages]) => {
            form.setError(field as keyof PublicBookingInput, { message: messages[0] });
          });
        }
        return;
      }
      setReference(result.data.reference);
      setConfirmedBooking(result.data.booking);
      setStep("confirmed");
    });
  }

  return (
    <Form {...form}>
      <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-[#0a1628] shadow-2xl">
        <SeatSelectionModal open={showSeatModal} onClose={() => setStep("search")}>
          {seatSelectionField}
        </SeatSelectionModal>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="h-auto w-full justify-start gap-0 rounded-none border-b border-white/10 bg-[#0d1a30] p-0">
          <TabsTrigger
            value="flights"
            className="gap-2 rounded-none border-b-2 border-transparent px-6 py-4 text-white/60 data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none"
          >
            <Plane className="size-4" />
            Flights
          </TabsTrigger>
          <TabsTrigger
            value="cars"
            disabled
            className="gap-2 rounded-none px-6 py-4 text-white/30"
          >
            <Car className="size-4" />
            Cars
          </TabsTrigger>
          <TabsTrigger
            value="hotels"
            disabled
            className="gap-2 rounded-none px-6 py-4 text-white/30"
          >
            <Hotel className="size-4" />
            Hotels
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flights" className="mt-0">
          {step === "seats" && !isMobile && (
            <div className="-mx-0 rounded-b-xl bg-white px-5 py-6 sm:px-8 sm:py-8">
              {seatSelectionField}
            </div>
          )}
          <div className={cn("p-5 sm:p-8", step === "seats" && !isMobile && "hidden")}>
            <AnimatePresence mode="wait">
              {step === "confirmed" && reference && boardingPassData ? (
                <motion.div
                  key="confirmed"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="-mx-1 py-1"
                >
                  <BoardingPassScreen
                    variant="embedded"
                    data={boardingPassData}
                    notchColor="#0a1628"
                    footer={
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          asChild
                          variant="outline"
                          className="h-11 flex-1 rounded-full border-white/30 bg-transparent text-white hover:bg-white/10"
                        >
                          <Link href={`/booking/${reference}`}>View full boarding pass</Link>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-11 flex-1 rounded-full border-white/30 bg-transparent text-white hover:bg-white/10"
                          onClick={() => {
                            setStep("search");
                            setReference(null);
                            setConfirmedBooking(null);
                            form.reset();
                          }}
                        >
                          Book another flight
                        </Button>
                      </div>
                    }
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={formStep}
                  initial={{ opacity: 0, x: formStep === "search" ? -12 : 12 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <form
                      onSubmit={
                        formStep === "search"
                          ? onSearchStep
                          : step === "passenger"
                            ? form.handleSubmit(onBookSubmit)
                            : (e) => e.preventDefault()
                      }
                      className="min-w-0 space-y-5"
                    >
                      {formStep === "search" ? (
                        <>
                          <div className="flex gap-2">
                            {(["round-trip", "one-way"] as const).map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => {
                                  form.setValue("tripType", type);
                                  if (type === "one-way") form.setValue("returnDate", "");
                                }}
                                className={cn(
                                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                                  tripType === type
                                    ? "bg-white text-[#0a1628]"
                                    : "text-white/70 hover:text-white",
                                )}
                              >
                                {type === "round-trip" ? "Round trip" : "One way"}
                              </button>
                            ))}
                          </div>

                          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="from"
                              render={({ field }) => (
                                <FormItem className="min-w-0">
                                  <FormLabel className="text-white/70">From</FormLabel>
                                  <FormControl>
                                    <AirportSearchInput
                                      value={field.value}
                                      onChange={field.onChange}
                                      placeholder="City or airport"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="to"
                              render={({ field }) => (
                                <FormItem className="min-w-0">
                                  <FormLabel className="text-white/70">To</FormLabel>
                                  <FormControl>
                                    <AirportSearchInput
                                      value={field.value}
                                      onChange={field.onChange}
                                      placeholder="City or airport"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div
                            className={cn(
                              "grid min-w-0 gap-4",
                              tripType === "round-trip" ? "grid-cols-2" : "grid-cols-1",
                            )}
                          >
                            <FormField
                              control={form.control}
                              name="departureDate"
                              render={({ field }) => (
                                <FormItem className="min-w-0">
                                  <FormLabel className="text-white/70">Departure</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="date"
                                      className="booking-date-input border-white/20 bg-white/10 text-white [color-scheme:dark]"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            {tripType === "round-trip" && (
                              <FormField
                                control={form.control}
                                name="returnDate"
                                render={({ field }) => (
                                  <FormItem className="min-w-0">
                                    <FormLabel className="text-white/70">Return</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="date"
                                        className="booking-date-input border-white/20 bg-white/10 text-white [color-scheme:dark]"
                                        {...field}
                                        value={field.value ?? ""}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                          </div>

                          <div className="grid min-w-0 gap-4 sm:grid-cols-3">
                            <FormField
                              control={form.control}
                              name="airlineIata"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white/70">Airline</FormLabel>
                                  <FormControl>
                                    <AirlineSearchInput
                                      value={field.value}
                                      onChange={field.onChange}
                                      placeholder="Search airline"
                                    />
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
                                  <FormLabel className="text-white/70">Class</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="border-white/20 bg-white/10 text-white">
                                        <SelectValue />
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
                            <FormField
                              control={form.control}
                              name="adults"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white/70">Passengers</FormLabel>
                                  <Select
                                    onValueChange={(v) => field.onChange(Number(v))}
                                    value={String(field.value)}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="border-white/20 bg-white/10 text-white">
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {[1, 2, 3, 4, 5, 6].map((n) => (
                                        <SelectItem key={n} value={String(n)}>
                                          {n} adult{n > 1 ? "s" : ""}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex justify-end">
                            <Button
                              type="submit"
                              className="h-12 rounded-full bg-[#051024] px-8 text-white hover:bg-[#051024]/90"
                            >
                              <Search className="size-4" />
                              Choose seats
                            </Button>
                          </div>
                        </>
                      ) : formStep === "passenger" ? (
                        <>
                          <div className="flex items-center gap-2 text-white/80">
                            <User className="size-4" />
                            <span className="text-sm font-medium">Passenger details</span>
                            <button
                              type="button"
                              onClick={() => setStep("seats")}
                              className="ml-auto flex items-center gap-1 text-xs text-white/50 hover:text-white"
                            >
                              <ArrowLeftRight className="size-3" />
                              Edit seats
                            </button>
                          </div>

                          {selectedSeats.length > 0 && (
                            <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
                              Seats:{" "}
                              <span className="font-medium text-white">{selectedSeats.join(", ")}</span>
                            </p>
                          )}

                          <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="passengerFirstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white/70">First name</FormLabel>
                                  <FormControl>
                                    <Input
                                      className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
                                      placeholder="Amelia"
                                      {...field}
                                    />
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
                                  <FormLabel className="text-white/70">Last name</FormLabel>
                                  <FormControl>
                                    <Input
                                      className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
                                      placeholder="Carter"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                  <FormLabel className="text-white/70">
                                    Email (optional)
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="email"
                                      className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
                                      placeholder="you@email.com"
                                      {...field}
                                      value={field.value ?? ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex justify-end">
                            <Button
                              type="submit"
                              disabled={pending}
                              className="h-12 rounded-full bg-white px-8 text-[#0a1628] hover:bg-white/90"
                            >
                              {pending ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Plane className="size-4" />
                              )}
                              Complete booking
                            </Button>
                          </div>
                        </>
                      ) : null}
                    </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </Form>
  );
}

function defaultDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}
