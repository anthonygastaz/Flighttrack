import type {
  BookingSource,
  BookingStatus,
  FlightStatus,
  TravelClass,
} from "@/core/domain/enums";

/**
 * Database schema types matching the SQL migrations. Hand-authored to stay in
 * lock-step with supabase/migrations (normally generated via supabase gen types).
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface BookingRow {
  id: string;
  booking_reference: string;
  passenger_first_name: string;
  passenger_last_name: string;
  email: string | null;
  phone: string | null;
  airline: string;
  airline_iata: string | null;
  flight_number: string;
  departure_airport: string;
  arrival_airport: string;
  departure_city: string | null;
  arrival_city: string | null;
  departure_terminal: string | null;
  arrival_terminal: string | null;
  departure_gate: string | null;
  arrival_gate: string | null;
  departure_time: string;
  arrival_time: string;
  seat: string | null;
  travel_class: TravelClass;
  baggage_allowance: string | null;
  status: BookingStatus;
  booking_source: BookingSource;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type BookingInsert = {
  id?: string;
  booking_reference: string;
  passenger_first_name: string;
  passenger_last_name: string;
  email?: string | null;
  phone?: string | null;
  airline: string;
  airline_iata?: string | null;
  flight_number: string;
  departure_airport: string;
  arrival_airport: string;
  departure_city?: string | null;
  arrival_city?: string | null;
  departure_terminal?: string | null;
  arrival_terminal?: string | null;
  departure_gate?: string | null;
  arrival_gate?: string | null;
  departure_time: string;
  arrival_time: string;
  seat?: string | null;
  travel_class: TravelClass;
  baggage_allowance?: string | null;
  status: BookingStatus;
  booking_source?: BookingSource;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type BookingUpdate = {
  booking_reference?: string;
  passenger_first_name?: string;
  passenger_last_name?: string;
  email?: string | null;
  phone?: string | null;
  airline?: string;
  airline_iata?: string | null;
  flight_number?: string;
  departure_airport?: string;
  arrival_airport?: string;
  departure_city?: string | null;
  arrival_city?: string | null;
  departure_terminal?: string | null;
  arrival_terminal?: string | null;
  departure_gate?: string | null;
  arrival_gate?: string | null;
  departure_time?: string;
  arrival_time?: string;
  seat?: string | null;
  travel_class?: TravelClass;
  baggage_allowance?: string | null;
  status?: BookingStatus;
  booking_source?: BookingSource;
  notes?: string | null;
};

export interface FlightRow {
  id: string;
  flight_number: string;
  airline: string | null;
  origin: string | null;
  destination: string | null;
  scheduled_departure: string | null;
  scheduled_arrival: string | null;
  estimated_departure: string | null;
  estimated_arrival: string | null;
  status: FlightStatus;
  cached_at: string;
}

export type FlightInsert = Omit<FlightRow, "id" | "cached_at"> & {
  id?: string;
  cached_at?: string;
};

export interface SearchEventRow {
  id: string;
  query: string;
  matched_booking_id: string | null;
  result_type: "booking" | "flight" | "not_found";
  duration_ms: number | null;
  created_at: string;
}

export type SearchEventInsert = Omit<SearchEventRow, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: BookingRow;
        Insert: BookingInsert;
        Update: BookingUpdate;
        Relationships: [];
      };
      flights: {
        Row: FlightRow;
        Insert: FlightInsert;
        Update: Partial<FlightRow>;
        Relationships: [];
      };
      search_events: {
        Row: SearchEventRow;
        Insert: SearchEventInsert;
        Update: Partial<SearchEventRow>;
        Relationships: [
          {
            foreignKeyName: "search_events_matched_booking_id_fkey";
            columns: ["matched_booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      popular_airlines: {
        Args: { limit_count?: number };
        Returns: { airline: string; count: number }[];
      };
      popular_routes: {
        Args: { limit_count?: number };
        Returns: {
          departure_airport: string;
          arrival_airport: string;
          count: number;
        }[];
      };
      bookings_per_day: {
        Args: { day_count?: number };
        Returns: { day: string; count: number }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
