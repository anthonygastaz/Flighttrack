import Link from "next/link";

import { BrandLogo } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroHeaderProps {
  className?: string;
  /** When true, header floats over hero image. Default: in document flow below nothing. */
  overlay?: boolean;
}

export function HeroHeader({ className, overlay = false }: HeroHeaderProps) {
  return (
    <header
      className={cn(
        "w-full",
        overlay ? "absolute inset-x-0 top-0 z-50" : "relative z-10",
        className,
      )}
    >
      <div className="flex items-center justify-between px-6 py-5 lg:px-12">
        <BrandLogo variant="on-dark" nameClassName="text-white" />

        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            asChild
            size="sm"
            className="h-8 rounded-full bg-black px-4 text-xs font-medium text-white hover:bg-black/90"
          >
            <Link href="/track">Track flight</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
