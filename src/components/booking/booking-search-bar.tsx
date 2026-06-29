"use client";

import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeBookingReference } from "@/core/services/booking-reference-utils";
import { cn } from "@/lib/utils";

interface BookingSearchBarProps {
  defaultValue?: string;
  size?: "default" | "large";
  className?: string;
  autoFocus?: boolean;
}

export function BookingSearchBar({
  defaultValue = "",
  size = "default",
  className,
  autoFocus,
}: BookingSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const normalized = normalizeBookingReference(query);
    if (normalized.length < 2) return;
    router.push(`/booking/${encodeURIComponent(normalized)}`);
  }

  const isLarge = size === "large";

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      onSubmit={handleSubmit}
      className={cn(
        "flex w-full flex-col gap-3 sm:flex-row",
        isLarge && "sm:gap-2",
        className,
      )}
    >
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value.toUpperCase())}
          placeholder="Enter booking reference (e.g. FT93QK)"
          className={cn(
            "pl-11 font-mono uppercase tracking-widest",
            isLarge ? "h-14 rounded-xl text-base" : "h-11 rounded-lg",
          )}
          maxLength={12}
          autoFocus={autoFocus}
          aria-label="Booking reference"
        />
      </div>
      <Button
        type="submit"
        size={isLarge ? "lg" : "default"}
        className={cn(
          isLarge &&
            "btn-track-glow h-14 gap-2 rounded-full px-8 text-base font-medium",
        )}
      >
        Track flight
        <ArrowRight className="size-4" />
      </Button>
    </motion.form>
  );
}
