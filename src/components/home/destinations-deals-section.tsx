"use client";

import {
  ArrowLeftRight,
  ChevronDown,
  Info,
  Loader2,
  MapPin,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TRAVEL_CLASSES, TRAVEL_CLASS_LABELS, type TravelClass } from "@/core/domain/enums";
import { DEFAULT_ORIGIN_IATA } from "@/lib/airports/geo";
import { formatAirportLabel } from "@/lib/airports/format";
import type { Airport } from "@/lib/airports/types";
import { dealsForOrigin, formatUsdPrice } from "@/lib/deals/destinations";
import { DealThumbnail } from "@/components/home/deal-thumbnail";
import { cn } from "@/lib/utils";

const PRICE_DISCLAIMER =
  "The displayed prices are applicable for one adult. All amounts are in USD. Taxes and surcharges are included. Prices shown may vary depending on fare availability.";

export function DestinationsDealsSection() {
  const [originIata, setOriginIata] = useState(DEFAULT_ORIGIN_IATA);
  const [originCity, setOriginCity] = useState("New York");
  const [travelClass, setTravelClass] = useState<TravelClass>("economy");
  const [activeTab, setActiveTab] = useState<"flights" | "promo">("flights");
  const [locating, setLocating] = useState(true);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);

  const [airportQuery, setAirportQuery] = useState("");
  const [airportResults, setAirportResults] = useState<Airport[]>([]);
  const [airportSearchLoading, setAirportSearchLoading] = useState(false);
  const [originMenuOpen, setOriginMenuOpen] = useState(false);
  const [orderSeed] = useState(() => Math.random().toString(36).slice(2, 10));

  const resolveOrigin = useCallback(async (iata: string) => {
    try {
      const res = await fetch(`/api/airports/${encodeURIComponent(iata)}`);
      if (!res.ok) return;
      const data = (await res.json()) as { airport: Airport };
      if (data.airport) {
        setOriginIata(data.airport.iata);
        setOriginCity(data.airport.city);
      }
    } catch {
      // Keep current selection.
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function detectOrigin() {
      if (!navigator.geolocation) {
        setLocating(false);
        await resolveOrigin(DEFAULT_ORIGIN_IATA);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (cancelled) return;
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(
              `/api/airports/nearest?lat=${latitude}&lon=${longitude}`,
            );
            if (res.ok) {
              const data = (await res.json()) as { airport: Airport };
              setOriginIata(data.airport.iata);
              setOriginCity(data.airport.city);
              setLocationLabel(data.airport.city);
            } else {
              await resolveOrigin(DEFAULT_ORIGIN_IATA);
            }
          } catch {
            await resolveOrigin(DEFAULT_ORIGIN_IATA);
          } finally {
            if (!cancelled) setLocating(false);
          }
        },
        async () => {
          if (cancelled) return;
          await resolveOrigin(DEFAULT_ORIGIN_IATA);
          setLocating(false);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
      );
    }

    detectOrigin();
    return () => {
      cancelled = true;
    };
  }, [resolveOrigin]);

  useEffect(() => {
    if (!originMenuOpen) return;
    const term = airportQuery.trim();
    if (!term) {
      setAirportResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setAirportSearchLoading(true);
      try {
        const res = await fetch(`/api/airports/search?q=${encodeURIComponent(term)}`);
        const data = (await res.json()) as { results: Airport[] };
        setAirportResults(data.results ?? []);
      } catch {
        setAirportResults([]);
      } finally {
        setAirportSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [airportQuery, originMenuOpen]);

  const deals = useMemo(
    () => dealsForOrigin(originIata, travelClass, activeTab === "promo", orderSeed),
    [originIata, travelClass, activeTab, orderSeed],
  );

  function selectOrigin(airport: Airport) {
    setOriginIata(airport.iata);
    setOriginCity(airport.city);
    setLocationLabel(null);
    setOriginMenuOpen(false);
    setAirportQuery("");
    setAirportResults([]);
  }

  return (
    <section className="bg-white px-4 py-14 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center font-display text-3xl font-normal tracking-tight text-brand-navy sm:text-4xl">
          Destinations and deals
        </h2>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "flights" | "promo")}
          className="mt-8"
        >
          <TabsList className="mx-auto grid h-11 w-full max-w-md grid-cols-2 rounded-full bg-zinc-100 p-1">
            <TabsTrigger
              value="flights"
              className="rounded-full text-sm data-[state=active]:bg-white data-[state=active]:text-brand-navy data-[state=active]:shadow-sm"
            >
              Flights
            </TabsTrigger>
            <TabsTrigger
              value="promo"
              className="rounded-full text-sm data-[state=active]:bg-white data-[state=active]:text-brand-navy data-[state=active]:shadow-sm"
            >
              Promo rewards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flights" className="mt-8">
            <DealsPanel
              travelClass={travelClass}
              onTravelClassChange={setTravelClass}
              originCity={originCity}
              originIata={originIata}
              locating={locating}
              locationLabel={locationLabel}
              originMenuOpen={originMenuOpen}
              onOriginMenuOpenChange={setOriginMenuOpen}
              airportQuery={airportQuery}
              onAirportQueryChange={setAirportQuery}
              airportResults={airportResults}
              airportSearchLoading={airportSearchLoading}
              onSelectOrigin={selectOrigin}
              deals={deals}
            />
          </TabsContent>

          <TabsContent value="promo" className="mt-8">
            <DealsPanel
              travelClass={travelClass}
              onTravelClassChange={setTravelClass}
              originCity={originCity}
              originIata={originIata}
              locating={locating}
              locationLabel={locationLabel}
              originMenuOpen={originMenuOpen}
              onOriginMenuOpenChange={setOriginMenuOpen}
              airportQuery={airportQuery}
              onAirportQueryChange={setAirportQuery}
              airportResults={airportResults}
              airportSearchLoading={airportSearchLoading}
              onSelectOrigin={selectOrigin}
              deals={deals}
              promo
            />
          </TabsContent>
        </Tabs>

        <p className="mt-8 text-center text-xs leading-relaxed text-zinc-400">
          * {PRICE_DISCLAIMER}
        </p>
      </div>
    </section>
  );
}

interface DealsPanelProps {
  travelClass: TravelClass;
  onTravelClassChange: (value: TravelClass) => void;
  originCity: string;
  originIata: string;
  locating: boolean;
  locationLabel: string | null;
  originMenuOpen: boolean;
  onOriginMenuOpenChange: (open: boolean) => void;
  airportQuery: string;
  onAirportQueryChange: (value: string) => void;
  airportResults: Airport[];
  airportSearchLoading: boolean;
  onSelectOrigin: (airport: Airport) => void;
  deals: ReturnType<typeof dealsForOrigin>;
  promo?: boolean;
}

function DealsPanel({
  travelClass,
  onTravelClassChange,
  originCity,
  locating,
  locationLabel,
  originMenuOpen,
  onOriginMenuOpenChange,
  airportQuery,
  onAirportQueryChange,
  airportResults,
  airportSearchLoading,
  onSelectOrigin,
  deals,
  promo,
}: DealsPanelProps) {
  return (
    <>
      <p className="text-center text-base text-zinc-600 sm:text-lg">
        {promo ? "Exclusive promo fares in" : "Discover our best"}{" "}
        <ClassPicker value={travelClass} onChange={onTravelClassChange} /> cabin deals departing
        from{" "}
        <OriginPicker
          city={originCity}
          locating={locating}
          locationLabel={locationLabel}
          open={originMenuOpen}
          onOpenChange={onOriginMenuOpenChange}
          query={airportQuery}
          onQueryChange={onAirportQueryChange}
          results={airportResults}
          loading={airportSearchLoading}
          onSelect={onSelectOrigin}
        />
      </p>

      <ul className="mt-8 divide-y divide-zinc-200">
        {locating ? (
          <li className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
            <Loader2 className="size-4 animate-spin" />
            Finding deals near you…
          </li>
        ) : (
          deals.map((deal) => (
            <li key={deal.id}>
              <div className="flex items-center gap-4 py-5 sm:gap-5">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100 sm:size-[4.5rem]">
                  <DealThumbnail
                    city={deal.city}
                    imageUrl={deal.imageUrl}
                    imageFallbackUrl={deal.imageFallbackUrl}
                    className="absolute inset-0"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-brand-navy sm:text-lg">{deal.city}</p>
                  <p className="text-sm text-zinc-500">({deal.country})</p>
                </div>

                <div className="hidden items-center gap-2 text-sm text-zinc-500 sm:flex">
                  <ArrowLeftRight className="size-4 shrink-0" />
                  <span>Round trip</span>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <p className="text-right text-sm font-semibold text-brand-navy sm:text-base">
                    From {formatUsdPrice(deal.priceUsd)}*
                  </p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="flex size-6 items-center justify-center rounded-full border border-zinc-300 text-zinc-400 hover:text-zinc-600"
                          aria-label="Price information"
                        >
                          <Info className="size-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-xs text-xs">
                        {PRICE_DISCLAIMER}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </>
  );
}

function ClassPicker({
  value,
  onChange,
}: {
  value: TravelClass;
  onChange: (value: TravelClass) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-0.5 border-b border-brand-navy font-semibold text-brand-navy"
        >
          {TRAVEL_CLASS_LABELS[value]}
          <ChevronDown className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-48">
        {TRAVEL_CLASSES.map((c) => (
          <DropdownMenuItem key={c} onClick={() => onChange(c)} className={cn(value === c && "font-semibold")}>
            {TRAVEL_CLASS_LABELS[c]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function OriginPicker({
  city,
  locating,
  locationLabel,
  open,
  onOpenChange,
  query,
  onQueryChange,
  results,
  loading,
  onSelect,
}: {
  city: string;
  locating: boolean;
  locationLabel: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: string;
  onQueryChange: (value: string) => void;
  results: Airport[];
  loading: boolean;
  onSelect: (airport: Airport) => void;
}) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-0.5 border-b border-brand-navy font-semibold text-brand-navy"
          disabled={locating}
        >
          {locating ? "…" : city}
          <ChevronDown className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-72 p-2">
        {locationLabel && (
          <p className="mb-2 flex items-center gap-1.5 px-2 text-xs text-zinc-500">
            <MapPin className="size-3.5 text-brand-green" />
            Detected near {locationLabel}
          </p>
        )}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search city or airport"
            className="h-9 pl-8"
          />
          {loading && (
            <Loader2 className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-zinc-400" />
          )}
        </div>
        <div className="mt-1 max-h-56 overflow-y-auto">
          {results.length === 0 && query.trim() ? (
            <p className="px-2 py-3 text-center text-xs text-zinc-500">No airports found</p>
          ) : (
            results.map((airport) => (
              <DropdownMenuItem
                key={airport.iata}
                onClick={() => onSelect(airport)}
                className="flex flex-col items-start gap-0.5 py-2"
              >
                <span className="font-medium">{airport.city}</span>
                <span className="text-xs text-zinc-500">{formatAirportLabel(airport)}</span>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
