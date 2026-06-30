"use client";

import { ChevronLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AirplaneSilhouette } from "@/components/booking/airplane-silhouette";
import { Button } from "@/components/ui/button";
import type { TravelClass } from "@/core/domain/enums";
import {
  CABIN_SECTIONS,
  generateOccupiedSeats,
  getSectionById,
  sectionForTravelClass,
  type CabinSection,
} from "@/lib/seats/cabin-layout";
import {
  SKY_BLUE,
  SKY_BLUE_DARK,
  SKY_BLUE_HOVER,
  SKY_BLUE_LIGHT,
  SKY_BLUE_MUTED,
} from "@/lib/brand-colors";
import { cn } from "@/lib/utils";

interface SeatSelectionStepProps {
  travelClass: TravelClass;
  adults: number;
  value: string[];
  onChange: (seats: string[]) => void;
  onContinue: () => void;
  onBack: () => void;
  error?: string;
}

export function SeatSelectionStep({
  travelClass,
  adults,
  value,
  onChange,
  onContinue,
  onBack,
  error,
}: SeatSelectionStepProps) {
  const [activeSectionId, setActiveSectionId] = useState(() => sectionForTravelClass(travelClass));

  useEffect(() => {
    setActiveSectionId(sectionForTravelClass(travelClass));
  }, [travelClass]);

  const occupiedBySection = useMemo(() => {
    const map = new Map<number, Set<string>>();
    for (const section of CABIN_SECTIONS) {
      map.set(section.id, generateOccupiedSeats(section, adults + 3));
    }
    return map;
  }, [adults]);

  const section = getSectionById(activeSectionId) ?? CABIN_SECTIONS[0]!;
  const occupied = occupiedBySection.get(section.id) ?? new Set<string>();

  function toggleSeat(seatId: string) {
    if (occupied.has(seatId)) return;

    if (value.includes(seatId)) {
      onChange(value.filter((s) => s !== seatId));
      return;
    }

    if (value.length >= adults) {
      onChange([...value.slice(1), seatId]);
      return;
    }

    onChange([...value, seatId]);
  }

  const selectionHint =
    adults === 1
      ? "Select 1 seat"
      : `Select ${adults} seats (${value.length}/${adults})`;

  return (
    <div className="space-y-5 text-zinc-900">
      <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex size-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-50 md:hidden"
              aria-label="Back to search"
            >
              <ChevronLeft className="size-5" />
            </button>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Choose Seats</h2>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="hidden text-sm text-zinc-500 transition-colors hover:text-zinc-900 md:inline-flex md:items-center md:gap-1"
          >
            <ChevronLeft className="size-4" />
            Edit trip
          </button>
        </div>

        <AirplaneSilhouette activeSection={activeSectionId} />

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-zinc-500">Sections</span>
          <div className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-1">
            {CABIN_SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSectionId(s.id)}
                className={cn(
                  "min-w-10 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  activeSectionId === s.id
                    ? "text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900",
                )}
                style={
                  activeSectionId === s.id ? { backgroundColor: SKY_BLUE } : undefined
                }
              >
                {s.id}
              </button>
            ))}
          </div>
          <span className="text-xs text-zinc-400 sm:ml-auto">{selectionHint}</span>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-zinc-800">
              {section.title} ({section.classLabel})
            </p>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: SKY_BLUE }} />
                Free
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-zinc-200" />
                Booked
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="size-2.5 rounded-full ring-2 ring-[#4D94FF] ring-offset-1"
                  style={{ backgroundColor: SKY_BLUE_DARK }}
                />
                Yours
              </span>
            </div>
          </div>

          <div className="touch-pan-x overflow-x-auto pb-1">
            <SeatMap
              section={section}
              occupied={occupied}
              selected={value}
              onToggle={toggleSeat}
            />
          </div>
        </div>

        {value.length > 0 && (
          <p className="text-sm text-zinc-600">
            Selected:{" "}
            <span className="font-medium" style={{ color: SKY_BLUE }}>
              {value.join(", ")}
            </span>
          </p>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="hidden rounded-full border-zinc-300 sm:inline-flex"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={onContinue}
          disabled={value.length !== adults}
          className="h-12 rounded-full px-8 text-white hover:opacity-90"
          style={{ backgroundColor: SKY_BLUE }}
        >
          Continue to passenger details
        </Button>
      </div>
    </div>
  );
}

interface SeatMapProps {
  section: CabinSection;
  occupied: Set<string>;
  selected: string[];
  onToggle: (seatId: string) => void;
}

function SeatMap({ section, occupied, selected, onToggle }: SeatMapProps) {
  return (
    <div className="mx-auto min-w-[240px] max-w-sm">
      <CabinEnd />

      {Array.from({ length: section.rows }, (_, rowIndex) => {
        const row = rowIndex + 1;
        return (
          <div key={row} className="flex items-center justify-center gap-2 py-1.5 sm:gap-3">
            <span className="w-5 shrink-0 text-center text-xs text-zinc-400">{row}</span>
            {section.columnGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="flex items-center gap-1.5 sm:gap-2">
                {groupIndex > 0 && <div className="w-4 sm:w-8" aria-hidden />}
                {group.map((letter) => {
                  const seatId = `${row}${letter}`;
                  const isOccupied = occupied.has(seatId);
                  const isSelected = selected.includes(seatId);

                  return (
                    <SeatButton
                      key={seatId}
                      seatId={seatId}
                      isOccupied={isOccupied}
                      isSelected={isSelected}
                      onToggle={() => onToggle(seatId)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        );
      })}

      <CabinEnd />
    </div>
  );
}

function CabinEnd() {
  return (
    <div
      className="my-2 h-6 rounded-md border border-zinc-100 bg-[repeating-linear-gradient(-45deg,#f4f4f5,#f4f4f5_4px,#e4e4e7_4px,#e4e4e7_8px)]"
      aria-hidden
    />
  );
}

interface SeatButtonProps {
  seatId: string;
  isOccupied: boolean;
  isSelected: boolean;
  onToggle: () => void;
}

function SeatButton({ seatId, isOccupied, isSelected, onToggle }: SeatButtonProps) {
  return (
    <button
      type="button"
      disabled={isOccupied}
      onClick={onToggle}
      title={seatId}
      aria-label={`Seat ${seatId}${isOccupied ? ", booked" : isSelected ? ", selected" : ", available"}`}
      aria-pressed={isSelected}
      className={cn(
        "group relative flex h-9 w-8 flex-col items-center justify-end rounded-md border pb-0.5 transition-all sm:h-10 sm:w-9",
        isOccupied && "cursor-not-allowed border-zinc-200 bg-zinc-200",
        !isOccupied && !isSelected && "hover:shadow-md",
        isSelected && "ring-2 ring-[#4D94FF] ring-offset-1",
      )}
      style={
        isOccupied
          ? undefined
          : isSelected
            ? { backgroundColor: SKY_BLUE_DARK, borderColor: SKY_BLUE_DARK }
            : { backgroundColor: SKY_BLUE, borderColor: SKY_BLUE_DARK }
      }
      onMouseEnter={(e) => {
        if (!isOccupied && !isSelected) e.currentTarget.style.backgroundColor = SKY_BLUE_HOVER;
      }}
      onMouseLeave={(e) => {
        if (!isOccupied && !isSelected) e.currentTarget.style.backgroundColor = SKY_BLUE;
      }}
    >
      <span
        className="mb-0.5 block h-2 w-5 rounded-t-sm sm:w-6"
        style={
          isOccupied
            ? { backgroundColor: "#d4d4d8" }
            : isSelected
              ? { backgroundColor: SKY_BLUE_MUTED }
              : { backgroundColor: SKY_BLUE_LIGHT }
        }
      />
      <span className="sr-only">{seatId}</span>
    </button>
  );
}
