import { FlightBookingWidget } from "@/components/booking/flight-booking-widget";
import { DestinationsDealsSection } from "@/components/home/destinations-deals-section";
import { HeroHeader } from "@/components/layout/hero-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#051024]">
      {/* Hero — header + headline only; booking lives below this block */}
      <section
        className="relative h-[56vh] min-h-[420px] max-h-[620px] w-full overflow-hidden bg-[#051024] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero-header-bg.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#051024]/35 via-transparent via-45% to-[#051024]" />

        <HeroHeader overlay />

        <div className="relative flex h-full flex-col items-center justify-end px-6 pb-12 pt-24 text-center">
          <h1 className="max-w-5xl text-[clamp(3.75rem,14vw,11rem)] font-normal italic leading-[0.9] tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
            <span className="block">Discover</span>
            <span className="block">the world.</span>
          </h1>
          <p className="mt-4 max-w-lg text-base text-white/85 drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)] sm:text-lg">
            From booking confirmation to arrival, stay informed with live flight updates, seamless booking management, and instant itinerary tracking.
          </p>
        </div>
      </section>

      {/* Booking card — sits under the hero, never overlaps the header */}
      <section id="flights" className="relative z-10 bg-[#051024] px-4 py-10 sm:px-6 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <FlightBookingWidget />
        </div>
      </section>

      <DestinationsDealsSection />

      <SiteFooter />
    </div>
  );
}
