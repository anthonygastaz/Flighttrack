import { BookingForm } from "@/components/admin/booking-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultBookingFormValues } from "@/lib/booking-form-utils";

export default function NewBookingPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Create booking"
        description="A unique 6-character booking reference will be generated automatically."
      />
      <Card className="admin-panel border-zinc-200/80">
        <CardHeader>
          <CardTitle className="font-display text-xl font-normal text-zinc-900">
            Booking details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BookingForm mode="create" defaultValues={defaultBookingFormValues()} />
        </CardContent>
      </Card>
    </div>
  );
}
