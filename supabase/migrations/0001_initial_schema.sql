-- FlightTrack initial schema
-- bookings, flights cache, search analytics

-- ---------------------------------------------------------------------------
-- Enums (stored as text with CHECK constraints for portability)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference VARCHAR(6) NOT NULL UNIQUE,
  passenger_first_name TEXT NOT NULL,
  passenger_last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  airline TEXT NOT NULL,
  airline_iata VARCHAR(3),
  flight_number TEXT NOT NULL,
  departure_airport VARCHAR(3) NOT NULL,
  arrival_airport VARCHAR(3) NOT NULL,
  departure_city TEXT,
  arrival_city TEXT,
  departure_terminal TEXT,
  arrival_terminal TEXT,
  departure_gate TEXT,
  arrival_gate TEXT,
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ NOT NULL,
  seat TEXT,
  travel_class TEXT NOT NULL DEFAULT 'economy'
    CHECK (travel_class IN ('economy', 'premium_economy', 'business', 'first')),
  baggage_allowance TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('confirmed', 'checked_in', 'boarding', 'departed', 'delayed', 'cancelled', 'completed')),
  booking_source TEXT NOT NULL DEFAULT 'demo'
    CHECK (booking_source IN ('demo', 'imported', 'api')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings (booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_flight_number ON bookings (flight_number);
CREATE INDEX IF NOT EXISTS idx_bookings_departure_time ON bookings (departure_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings (created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bookings_updated_at ON bookings;
CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Flight status cache
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_number TEXT NOT NULL,
  airline TEXT,
  origin VARCHAR(3),
  destination VARCHAR(3),
  scheduled_departure TIMESTAMPTZ,
  scheduled_arrival TIMESTAMPTZ,
  estimated_departure TIMESTAMPTZ,
  estimated_arrival TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'unknown'
    CHECK (status IN ('scheduled', 'active', 'landed', 'delayed', 'cancelled', 'diverted', 'unknown')),
  cached_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_flights_number ON flights (flight_number);
CREATE INDEX IF NOT EXISTS idx_flights_cached_at ON flights (cached_at DESC);

-- ---------------------------------------------------------------------------
-- Search analytics
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS search_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  matched_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  result_type TEXT NOT NULL
    CHECK (result_type IN ('booking', 'flight', 'not_found')),
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_events_created_at ON search_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_events_result_type ON search_events (result_type);

-- ---------------------------------------------------------------------------
-- Row Level Security — locked down; all access via service role on server
-- ---------------------------------------------------------------------------

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_events ENABLE ROW LEVEL SECURITY;

-- No public policies — server-side service role bypasses RLS.
