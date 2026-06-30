import { NextResponse } from "next/server";

import { getServices } from "@/core/container";
import { statusForError } from "@/core/domain/result";
import { requireAdmin } from "@/lib/auth/admin";
import { bookingFormSchema, bookingFormValuesToInput } from "@/lib/validation/booking-schema";

function toCreateInput(values: ReturnType<typeof bookingFormSchema.parse>) {
  return bookingFormValuesToInput(values);
}

/** POST /api/bookings — create a booking (admin). */
export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = bookingFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const values = parsed.data;
    const services = getServices();
    const result = await services.bookings.create(toCreateInput(values));

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: statusForError(result.error.code) },
      );
    }

    return NextResponse.json({
      success: true,
      bookingReference: result.data.bookingReference,
    });
  } catch {
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
