-- Per-leg flight details for multi-stop itineraries.
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS flight_segments JSONB NOT NULL DEFAULT '[]'::jsonb;
