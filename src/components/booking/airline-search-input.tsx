"use client";

import { Loader2, Plane } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { formatAirlineLabel } from "@/lib/airlines/format";
import type { Airline } from "@/lib/airlines/types";
import { cn } from "@/lib/utils";

interface AirlineSearchInputProps {
  value: string;
  onChange: (iata: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

export function AirlineSearchInput({
  value,
  onChange,
  placeholder = "Search airline",
  className,
  inputClassName,
}: AirlineSearchInputProps) {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<Airline[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAirlines = useCallback(async (term: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/airlines/search?q=${encodeURIComponent(term)}`);
      const data = (await res.json()) as { results: Airline[] };
      setSuggestions(data.results ?? []);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveLabel = useCallback(async (iata: string) => {
    if (!iata) return;
    try {
      const res = await fetch(`/api/airlines/${encodeURIComponent(iata)}`);
      if (res.ok) {
        const data = (await res.json()) as { airline: Airline };
        setQuery(formatAirlineLabel(data.airline));
      }
    } catch {
      setQuery(iata);
    }
  }, []);

  useEffect(() => {
    if (value && !open) {
      void resolveLabel(value);
    }
  }, [value, open, resolveLabel]);

  useEffect(() => {
    setActiveIndex(0);
  }, [suggestions]);

  useEffect(() => {
    if (!open || !query.trim()) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void fetchAirlines(query);
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, open, fetchAirlines]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        if (value) void resolveLabel(value);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value, resolveLabel]);

  function selectAirline(airline: Airline) {
    onChange(airline.iata);
    setQuery(formatAirlineLabel(airline));
    setOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" && suggestions[activeIndex]) {
      event.preventDefault();
      selectAirline(suggestions[activeIndex]!);
    } else if (event.key === "Escape") {
      setOpen(false);
      if (value) void resolveLabel(value);
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => {
            const next = e.target.value;
            setQuery(next);
            setOpen(next.trim().length > 0);
          }}
          onFocus={() => {
            if (query.trim()) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          className={cn(
            "border-white/20 bg-white/10 pr-9 text-white placeholder:text-white/40",
            inputClassName,
          )}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-white/40" />
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-white/15 bg-[#0d1a30] py-1 shadow-xl"
        >
          {suggestions.map((airline, index) => (
            <li key={airline.iata} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectAirline(airline)}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors",
                  index === activeIndex
                    ? "bg-white/10 text-white"
                    : "text-white/80 hover:bg-white/5",
                )}
              >
                <Plane className="size-4 shrink-0 text-white/40" />
                <span className="min-w-0 flex-1">
                  <span className="font-medium">{airline.name}</span>
                  {airline.country && (
                    <span className="block text-xs text-white/40">{airline.country}</span>
                  )}
                </span>
                <span className="shrink-0 font-mono text-xs text-white/50">{airline.iata}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && !loading && query.trim().length > 0 && suggestions.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-white/15 bg-[#0d1a30] px-3 py-3 text-sm text-white/50 shadow-xl">
          No airlines found — try a name or code
        </div>
      )}
    </div>
  );
}
