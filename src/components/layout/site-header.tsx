import Link from "next/link";

import { BrandLogo } from "@/components/layout/brand-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <BrandLogo variant="adaptive" size="sm" nameClassName="text-foreground" />

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/track" className="transition-colors hover:text-foreground">
            Track
          </Link>
          <Link href="/#flights" className="transition-colors hover:text-foreground">
            Book
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link href="/admin">Admin</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
