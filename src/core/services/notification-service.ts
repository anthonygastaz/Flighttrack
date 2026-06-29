import type { Booking } from "@/core/domain/booking";
import { passengerFullName, routeLabel } from "@/core/domain/booking";
import { APP_NAME } from "@/lib/brand";
import { BOOKING_STATUS_LABELS } from "@/core/domain/enums";
import { serverEnv } from "@/lib/env";

export type NotificationEvent =
  | "booking_created"
  | "booking_updated"
  | "flight_delayed"
  | "flight_cancelled"
  | "check_in_reminder";

const EVENT_SUBJECTS: Record<NotificationEvent, (b: Booking) => string> = {
  booking_created: (b) => `Your ${APP_NAME} booking ${b.bookingReference} is confirmed`,
  booking_updated: (b) => `Update to your booking ${b.bookingReference}`,
  flight_delayed: (b) => `Delay notice: ${b.flightNumber}`,
  flight_cancelled: (b) => `Cancelled: ${b.flightNumber}`,
  check_in_reminder: (b) => `Check-in is open for ${b.flightNumber}`,
};

/**
 * Reusable notification service. Sends email (Resend) and SMS (Twilio) when the
 * respective providers are configured; otherwise it is a no-op that reports
 * which channels were skipped. Failures never throw to the caller.
 */
export class NotificationService {
  async notify(event: NotificationEvent, booking: Booking): Promise<{
    email: "sent" | "skipped" | "failed";
    sms: "sent" | "skipped" | "failed";
  }> {
    const [email, sms] = await Promise.all([
      this.sendEmail(event, booking),
      this.sendSms(event, booking),
    ]);
    return { email, sms };
  }

  private buildBody(event: NotificationEvent, booking: Booking): string {
    const lines = [
      `Hi ${passengerFullName(booking)},`,
      "",
      `Booking reference: ${booking.bookingReference}`,
      `Flight: ${booking.airline} ${booking.flightNumber}`,
      `Route: ${routeLabel(booking)}`,
      `Departs: ${new Date(booking.departureTime).toUTCString()}`,
      `Status: ${BOOKING_STATUS_LABELS[booking.status]}`,
      "",
      `Track your booking at any time on ${APP_NAME}.`,
    ];
    void event;
    return lines.join("\n");
  }

  private async sendEmail(
    event: NotificationEvent,
    booking: Booking,
  ): Promise<"sent" | "skipped" | "failed"> {
    if (!serverEnv.resend.isConfigured || !booking.email) return "skipped";
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serverEnv.resend.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: serverEnv.resend.fromEmail,
          to: [booking.email],
          subject: EVENT_SUBJECTS[event](booking),
          text: this.buildBody(event, booking),
        }),
      });
      return response.ok ? "sent" : "failed";
    } catch {
      return "failed";
    }
  }

  private async sendSms(
    event: NotificationEvent,
    booking: Booking,
  ): Promise<"sent" | "skipped" | "failed"> {
    if (!serverEnv.twilio.isConfigured || !booking.phone) return "skipped";
    try {
      const credentials = Buffer.from(
        `${serverEnv.twilio.accountSid}:${serverEnv.twilio.authToken}`,
      ).toString("base64");
      const body = new URLSearchParams({
        To: booking.phone,
        From: serverEnv.twilio.fromNumber,
        Body: `${EVENT_SUBJECTS[event](booking)} — ${routeLabel(booking)}.`,
      });
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${serverEnv.twilio.accountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
        },
      );
      return response.ok ? "sent" : "failed";
    } catch {
      return "failed";
    }
  }
}
