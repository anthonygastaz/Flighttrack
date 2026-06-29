-- Analytics SQL functions for dashboard and analytics page

CREATE OR REPLACE FUNCTION popular_airlines(limit_count INTEGER DEFAULT 6)
RETURNS TABLE (airline TEXT, count BIGINT)
LANGUAGE sql STABLE AS $$
  SELECT airline, COUNT(*) AS count
  FROM bookings
  GROUP BY airline
  ORDER BY count DESC
  LIMIT limit_count;
$$;

CREATE OR REPLACE FUNCTION popular_routes(limit_count INTEGER DEFAULT 6)
RETURNS TABLE (
  departure_airport TEXT,
  arrival_airport TEXT,
  count BIGINT
)
LANGUAGE sql STABLE AS $$
  SELECT departure_airport, arrival_airport, COUNT(*) AS count
  FROM bookings
  GROUP BY departure_airport, arrival_airport
  ORDER BY count DESC
  LIMIT limit_count;
$$;

CREATE OR REPLACE FUNCTION bookings_per_day(day_count INTEGER DEFAULT 14)
RETURNS TABLE (day DATE, count BIGINT)
LANGUAGE sql STABLE AS $$
  SELECT DATE(created_at) AS day, COUNT(*) AS count
  FROM bookings
  WHERE created_at >= (CURRENT_DATE - (day_count - 1))
  GROUP BY DATE(created_at)
  ORDER BY day ASC;
$$;
