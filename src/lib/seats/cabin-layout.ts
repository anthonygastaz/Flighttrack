import type { TravelClass } from "@/core/domain/enums";

export interface CabinSection {
  id: number;
  title: string;
  classLabel: string;
  travelClass: TravelClass;
  /** Column groups separated by aisles, e.g. [["A","B"],["C","D"]] */
  columnGroups: string[][];
  rows: number;
}

export const CABIN_SECTIONS: CabinSection[] = [
  {
    id: 1,
    title: "Section 1",
    classLabel: "Business Class",
    travelClass: "business",
    columnGroups: [["A", "B"], ["C", "D"]],
    rows: 4,
  },
  {
    id: 2,
    title: "Section 2",
    classLabel: "Premium Economy",
    travelClass: "premium_economy",
    columnGroups: [["A", "B"], ["C", "D", "E"], ["F", "G"]],
    rows: 5,
  },
  {
    id: 3,
    title: "Section 3",
    classLabel: "Economy",
    travelClass: "economy",
    columnGroups: [["A", "B", "C"], ["D", "E", "F"]],
    rows: 7,
  },
];

export function sectionForTravelClass(travelClass: TravelClass): number {
  if (travelClass === "first" || travelClass === "business") return 1;
  if (travelClass === "premium_economy") return 2;
  return 3;
}

export function getSeatIds(section: CabinSection): string[] {
  const ids: string[] = [];
  for (let row = 1; row <= section.rows; row++) {
    for (const group of section.columnGroups) {
      for (const letter of group) {
        ids.push(`${row}${letter}`);
      }
    }
  }
  return ids;
}

/** Randomly mark ~30–45% of seats as occupied, keeping enough free for selection. */
export function generateOccupiedSeats(section: CabinSection, minAvailable: number): Set<string> {
  const ids = getSeatIds(section);
  const shuffled = [...ids].sort(() => Math.random() - 0.5);
  const targetOccupied = Math.min(
    ids.length - minAvailable,
    Math.floor(ids.length * (0.3 + Math.random() * 0.15)),
  );
  return new Set(shuffled.slice(0, Math.max(0, targetOccupied)));
}

export function getSectionById(id: number): CabinSection | undefined {
  return CABIN_SECTIONS.find((s) => s.id === id);
}
