"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plane, X } from "lucide-react";
import { useState } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/bookings": "Bookings",
  "/admin/bookings/new": "New booking",
  "/admin/analytics": "Analytics",
};

function resolveTitle(pathname: string): string {
  if (pathname.startsWith("/admin/bookings/") && pathname.endsWith("/edit")) {
    return "Edit booking";
  }
  return PAGE_TITLES[pathname] ?? "Admin";
}

export function AdminHeader() {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const title = resolveTitle(pathname);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-brand-navy-mid/95 px-4 backdrop-blur-md md:px-6 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="flex size-9 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <span className="font-display text-lg text-white">{title}</span>
        </div>
        <Button
          asChild
          size="sm"
          className="h-8 rounded-full bg-brand-sky px-4 text-xs font-medium text-white hover:bg-brand-sky-hover"
        >
          <Link href="/">View site</Link>
        </Button>
      </header>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close menu"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[min(100%,18rem)] shadow-2xl">
            <div className="flex h-14 items-center justify-end border-b border-white/10 bg-brand-navy-mid px-4">
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="flex size-9 items-center justify-center rounded-full text-white/80 hover:bg-white/10"
                aria-label="Close menu"
              >
                <X className="size-5" />
              </button>
            </div>
            <AdminSidebar onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}

      <header className="hidden h-16 items-center justify-between border-b border-white/10 bg-brand-navy-mid/80 px-8 backdrop-blur-md lg:flex">
        <div className="flex items-center gap-3 text-white/50">
          <Plane className="size-4 text-brand-sky" />
          <span className="text-sm">{title}</span>
        </div>
        <Button
          asChild
          size="sm"
          variant="outline"
          className="h-8 rounded-full border-white/20 bg-transparent text-xs text-white hover:bg-white/10 hover:text-white"
        >
          <Link href="/">View site</Link>
        </Button>
      </header>
    </>
  );
}
