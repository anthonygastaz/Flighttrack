"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Plane,
  Plus,
} from "lucide-react";

import { APP_NAME } from "@/lib/brand";
import { BrandLogo } from "@/components/layout/brand-logo";
import { signOutAction } from "@/server/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/bookings", label: "Bookings", icon: Plane },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
] as const;

interface AdminSidebarProps {
  onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-full flex-col bg-brand-navy-mid md:w-64 md:min-h-screen md:border-r md:border-white/10">
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <Link href="/admin" onClick={onNavigate} className="flex min-w-0 items-center gap-3">
          <BrandLogo href={null} variant="on-dark" size="sm" showName={false} className="gap-0" />
          <div className="min-w-0">
            <p className="truncate font-display text-base font-semibold text-white">{APP_NAME}</p>
            <p className="text-[11px] uppercase tracking-widest text-white/40">Admin</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon, ...rest }) => {
          const exact = "exact" in rest && rest.exact;
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-green text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-white/10 p-4">
        <Button
          asChild
          className="h-10 w-full justify-start gap-2 rounded-full bg-brand-orange text-white hover:bg-brand-orange/90"
        >
          <Link href="/admin/bookings/new" onClick={onNavigate}>
            <Plus className="size-4" />
            New booking
          </Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          className="h-10 w-full justify-start gap-2 rounded-full text-white/60 hover:bg-white/10 hover:text-white"
        >
          <Link href="/" onClick={onNavigate}>
            <ExternalLink className="size-4" />
            View site
          </Link>
        </Button>
        <form action={signOutAction}>
          <Button
            type="submit"
            variant="ghost"
            className="h-10 w-full justify-start gap-2 rounded-full text-white/60 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </form>
      </div>
    </aside>
  );
}
