"use client";

import type { Control } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { BookingFormInput } from "@/lib/validation/booking-schema";

interface FlightLegFieldsProps {
  control: Control<BookingFormInput>;
  index: number;
}

export function FlightLegFields({ control, index }: FlightLegFieldsProps) {
  const prefix = `flightSegments.${index}` as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField
        control={control}
        name={`${prefix}.airline`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Airline</FormLabel>
            <FormControl>
              <Input placeholder="Emirates" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`${prefix}.airlineIata`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Airline code</FormLabel>
            <FormControl>
              <Input placeholder="EK" className="uppercase" {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`${prefix}.flightNumber`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Flight number</FormLabel>
            <FormControl>
              <Input placeholder="EK202" className="uppercase" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`${prefix}.aircraft`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Aircraft</FormLabel>
            <FormControl>
              <Input placeholder="Airbus A380" {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`${prefix}.departureAirport`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>From airport</FormLabel>
            <FormControl>
              <Input placeholder="LHR" className="uppercase" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`${prefix}.arrivalAirport`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>To airport</FormLabel>
            <FormControl>
              <Input placeholder="DXB" className="uppercase" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`${prefix}.departureCity`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>From city</FormLabel>
            <FormControl>
              <Input placeholder="London" {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`${prefix}.arrivalCity`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>To city</FormLabel>
            <FormControl>
              <Input placeholder="Dubai" {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`${prefix}.departureTime`}
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
        control={control}
        name={`${prefix}.arrivalTime`}
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
      <FormField
        control={control}
        name={`${prefix}.departureTerminal`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Departure terminal</FormLabel>
            <FormControl>
              <Input placeholder="5" {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`${prefix}.arrivalTerminal`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Arrival terminal</FormLabel>
            <FormControl>
              <Input placeholder="3" {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`${prefix}.departureGate`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Departure gate</FormLabel>
            <FormControl>
              <Input placeholder="A12" {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`${prefix}.arrivalGate`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Arrival gate</FormLabel>
            <FormControl>
              <Input placeholder="B4" {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`${prefix}.seat`}
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
    </div>
  );
}
