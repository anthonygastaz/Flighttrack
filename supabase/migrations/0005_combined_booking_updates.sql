-- Run this once in the Supabase SQL editor if booking creation fails after recent updates.

ALTER TABLE bookings
  ALTER COLUMN booking_reference TYPE VARCHAR(13);

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS stops INTEGER NOT NULL DEFAULT 0;

ALTER TABLE bookings
  DROP CONSTRAINT IF EXISTS bookings_stops_check;

ALTER TABLE bookings
  ADD CONSTRAINT bookings_stops_check CHECK (stops >= 0 AND stops <= 3);

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS layovers JSONB NOT NULL DEFAULT '[]'::jsonb;
