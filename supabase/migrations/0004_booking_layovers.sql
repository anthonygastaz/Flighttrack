-- Optional stops and layover details for multi-segment itineraries.
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS stops INTEGER NOT NULL DEFAULT 0
    CHECK (stops >= 0 AND stops <= 3);

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS layovers JSONB NOT NULL DEFAULT '[]'::jsonb;
