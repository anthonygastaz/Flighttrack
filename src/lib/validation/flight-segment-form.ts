import { z } from "zod";

const iataAirport = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, "Use a 3-letter IATA airport code (e.g. LHR).");

const flightNumber = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9]{2,3}\d{1,4}$/, "Enter a valid flight number (e.g. BA249).");

const optionalText = z
  .string()
  .trim()
  .max(120)
  .optional()
  .or(z.literal(""));

export const flightSegmentFormSchema = z.object({
  airline: z.string().trim().min(2, "Airline is required.").max(80),
  airlineIata: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{2}$/, "Use a 2-character airline code (e.g. BA).")
    .optional()
    .or(z.literal("")),
  flightNumber,
  departureAirport: iataAirport,
  arrivalAirport: iataAirport,
  departureCity: optionalText,
  arrivalCity: optionalText,
  departureTime: z.string().min(1, "Departure time is required."),
  arrivalTime: z.string().min(1, "Arrival time is required."),
  departureTerminal: optionalText,
  arrivalTerminal: optionalText,
  departureGate: optionalText,
  arrivalGate: optionalText,
  seat: optionalText,
  aircraft: optionalText,
});

export type FlightSegmentFormValues = z.infer<typeof flightSegmentFormSchema>;

export function emptyFlightSegment(
  partial?: Partial<FlightSegmentFormValues>,
): FlightSegmentFormValues {
  return {
    airline: partial?.airline ?? "",
    airlineIata: partial?.airlineIata ?? "",
    flightNumber: partial?.flightNumber ?? "",
    departureAirport: partial?.departureAirport ?? "",
    arrivalAirport: partial?.arrivalAirport ?? "",
    departureCity: partial?.departureCity ?? "",
    arrivalCity: partial?.arrivalCity ?? "",
    departureTime: partial?.departureTime ?? "",
    arrivalTime: partial?.arrivalTime ?? "",
    departureTerminal: partial?.departureTerminal ?? "",
    arrivalTerminal: partial?.arrivalTerminal ?? "",
    departureGate: partial?.departureGate ?? "",
    arrivalGate: partial?.arrivalGate ?? "",
    seat: partial?.seat ?? "",
    aircraft: partial?.aircraft ?? "",
  };
}

interface RouteDefaults {
  airline: string;
  airlineIata: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureCity: string;
  arrivalCity: string;
  departureTime: string;
  arrivalTime: string;
  departureTerminal: string;
  arrivalTerminal: string;
  departureGate: string;
  arrivalGate: string;
  seat: string;
  layoverAirports: string[];
}

/** Build or trim the flight-leg array when the stop count changes. */
export function flightSegmentsForStops(
  stops: number,
  current: FlightSegmentFormValues[],
  route: RouteDefaults,
): FlightSegmentFormValues[] {
  if (stops <= 0) return [];

  const segmentCount = stops + 1;
  const next = [...current];

  while (next.length < segmentCount) {
    const index = next.length;
    const isFirst = index === 0;
    const isLast = index === segmentCount - 1;

    next.push(
      emptyFlightSegment({
        airline: isFirst ? route.airline : "",
        airlineIata: isFirst ? route.airlineIata : "",
        flightNumber: isFirst ? route.flightNumber : "",
        departureAirport: isFirst ? route.departureAirport : (route.layoverAirports[index - 1] ?? ""),
        arrivalAirport: isLast ? route.arrivalAirport : (route.layoverAirports[index] ?? ""),
        departureCity: isFirst ? route.departureCity : "",
        arrivalCity: isLast ? route.arrivalCity : "",
        departureTime: isFirst ? route.departureTime : "",
        arrivalTime: isLast ? route.arrivalTime : "",
        departureTerminal: isFirst ? route.departureTerminal : "",
        arrivalTerminal: isLast ? route.arrivalTerminal : "",
        departureGate: isFirst ? route.departureGate : "",
        arrivalGate: isLast ? route.arrivalGate : "",
        seat: isFirst ? route.seat : "",
      }),
    );
  }

  return next.slice(0, segmentCount);
}
