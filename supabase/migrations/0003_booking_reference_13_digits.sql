-- Expand booking references from 6-char alphanumeric to 13-digit numeric codes.
ALTER TABLE bookings
  ALTER COLUMN booking_reference TYPE VARCHAR(13);
