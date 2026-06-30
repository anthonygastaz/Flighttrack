import Link from "next/link";
import { Diamond } from "lucide-react";

import { APP_NAME } from "@/lib/brand";
import { BRAND_NAVY, BRAND_ORANGE } from "@/lib/brand-colors";
import { cn } from "@/lib/utils";

const PAGE_LINKS = [
  { href: "/", label: "Homepage" },
  { href: "/track", label: "Track booking" },
  { href: "/#flights", label: "Book a flight" },
] as const;

interface SiteFooterProps {
  className?: string;
}

export function SiteFooter({ className }: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={cn("text-white", className)} style={{ backgroundColor: BRAND_NAVY }}>
      {/* Link columns */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">
            Pages
          </p>
          <nav className="mt-6 flex flex-col">
            {PAGE_LINKS.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "border-t border-white/10 py-3.5 text-sm text-white/80 transition-colors hover:text-white",
                  index === PAGE_LINKS.length - 1 && "border-b",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Orange accent block */}
      <div className="text-black" style={{ backgroundColor: BRAND_ORANGE }}>
        <div className="mx-auto max-w-6xl border-b border-black/15">
          <div className="grid grid-cols-1 md:grid-cols-12">
            <div className="flex items-start gap-4 border-b border-black/15 px-6 py-8 md:col-span-3 md:border-b-0 md:border-r md:py-10">
              <div className="mt-1 flex size-8 shrink-0 items-center justify-center border border-black/20 bg-black/5">
                <Diamond className="size-3.5" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-black/50">
                  Live tracking
                </p>
                <p className="mt-1 text-sm font-medium">Always on</p>
              </div>
            </div>

            <div className="border-b border-black/15 px-6 py-8 md:col-span-4 md:border-b-0 md:border-r md:py-10">
              <p className="font-mono text-[10px] uppercase tracking-widest text-black/50">
                Global network
              </p>
              <p className="mt-2 font-mono text-3xl font-medium tracking-tight sm:text-4xl">
                960+
              </p>
              <p className="mt-1 text-sm text-black/70">Airlines worldwide</p>
            </div>

            <div className="px-6 py-8 md:col-span-5 md:py-10">
              <p className="max-w-sm text-sm leading-relaxed text-black/75">
                Book your itinerary, choose your seats, and track every leg of your journey with a
                single reference — built for travellers who expect clarity at every step.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl overflow-hidden px-6 pb-6 pt-4 md:px-10 md:pb-8 md:pt-2">
          <p
            className="font-display select-none text-[clamp(3.5rem,14vw,9rem)] leading-[0.85] tracking-tight text-black"
          >
            {APP_NAME}
          </p>
        </div>
      </div>

      {/* Legal bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between md:px-10">
          <p>© {APP_NAME}, {year}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>All rights reserved</span>
            <Link href="#" className="transition-colors hover:text-white/80">
              Terms of use
            </Link>
            <Link href="#" className="transition-colors hover:text-white/80">
              Privacy policy
            </Link>
            <Diamond className="size-3 text-[#FF5500]" strokeWidth={1.5} aria-hidden />
          </div>
        </div>
      </div>
    </footer>
  );
}
