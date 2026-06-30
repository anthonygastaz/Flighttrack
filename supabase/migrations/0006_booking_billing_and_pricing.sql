-- Billing and flight price details for bookings.
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS billing_name TEXT,
  ADD COLUMN IF NOT EXISTS billing_email TEXT,
  ADD COLUMN IF NOT EXISTS billing_phone TEXT,
  ADD COLUMN IF NOT EXISTS billing_address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS billing_address_line2 TEXT,
  ADD COLUMN IF NOT EXISTS billing_city TEXT,
  ADD COLUMN IF NOT EXISTS billing_state TEXT,
  ADD COLUMN IF NOT EXISTS billing_postal_code TEXT,
  ADD COLUMN IF NOT EXISTS billing_country TEXT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS fare_subtotal NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS taxes_fees NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS total_price NUMERIC(12, 2);

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS currency VARCHAR(3) NOT NULL DEFAULT 'USD';
