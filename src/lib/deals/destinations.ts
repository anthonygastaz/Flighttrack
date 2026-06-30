import type { TravelClass } from "@/core/domain/enums";
import { airportDistanceKm } from "@/lib/airports/geo";
import { findAirportByIata } from "@/lib/airports/search";

export interface DestinationDeal {
  id: string;
  city: string;
  country: string;
  airportIata: string;
  /** Primary thumbnail (Wikimedia Commons). */
  imageUrl: string;
  /** Stable fallback if primary fails to load. */
  imageFallbackUrl: string;
}

/** Popular international destinations shown in the deals list. */
export const DESTINATION_CATALOG: DestinationDeal[] = [
  {
    id: "paris",
    city: "Paris",
    country: "France",
    airportIata: "CDG",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/La_Tour_Eiffel%2C_Paris_26_janvier_2014.jpg/320px-La_Tour_Eiffel%2C_Paris_26_janvier_2014.jpg",
    imageFallbackUrl: "https://picsum.photos/seed/ft-paris/144/144",
  },
  {
    id: "toronto",
    city: "Toronto",
    country: "Canada",
    airportIata: "YYZ",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Toronto_Skyline_viewed_from_Algonquin_Island_%2816-9_crop%29.jpg/320px-Toronto_Skyline_viewed_from_Algonquin_Island_%2816-9_crop%29.jpg",
    imageFallbackUrl: "https://picsum.photos/seed/ft-toronto/144/144",
  },
  {
    id: "mumbai",
    city: "Mumbai",
    country: "India",
    airportIata: "BOM",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Gateway_of_India%2C_Mumbai_2019.jpg/320px-Gateway_of_India%2C_Mumbai_2019.jpg",
    imageFallbackUrl: "https://picsum.photos/seed/ft-mumbai/144/144",
  },
  {
    id: "houston",
    city: "Houston",
    country: "United States",
    airportIata: "IAH",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Houston_skyline_from_Sabine_Park.jpg/320px-Houston_skyline_from_Sabine_Park.jpg",
    imageFallbackUrl: "https://picsum.photos/seed/ft-houston/144/144",
  },
  {
    id: "edinburgh",
    city: "Edinburgh",
    country: "United Kingdom",
    airportIata: "EDI",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Edinburgh_Castle_scotland.jpg/320px-Edinburgh_Castle_scotland.jpg",
    imageFallbackUrl: "https://picsum.photos/seed/ft-edinburgh/144/144",
  },
  {
    id: "new-york",
    city: "New York",
    country: "United States",
    airportIata: "JFK",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg/320px-View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg",
    imageFallbackUrl: "https://picsum.photos/seed/ft-newyork/144/144",
  },
  {
    id: "dubai",
    city: "Dubai",
    country: "United Arab Emirates",
    airportIata: "DXB",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Dubai_Skylines_at_night_%28Pexels_378783%29.jpg/320px-Dubai_Skylines_at_night_%28Pexels_378783%29.jpg",
    imageFallbackUrl: "https://picsum.photos/seed/ft-dubai/144/144",
  },
  {
    id: "tokyo",
    city: "Tokyo",
    country: "Japan",
    airportIata: "NRT",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Skytree_%E6%9D%B1%E4%BA%AC%E3%82%B9%E3%82%AB%E3%82%A4%E3%83%84%E3%83%AA%E3%83%BC.jpg/320px-Skytree_%E6%9D%B1%E4%BA%AC%E3%82%B9%E3%82%AB%E3%82%A4%E3%83%84%E3%83%AA%E3%83%BC.jpg",
    imageFallbackUrl: "https://picsum.photos/seed/ft-tokyo/144/144",
  },
  {
    id: "sydney",
    city: "Sydney",
    country: "Australia",
    airportIata: "SYD",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Sydney_Opera_House_%26_Harbour_Bridge.jpg/320px-Sydney_Opera_House_%26_Harbour_Bridge.jpg",
    imageFallbackUrl: "https://picsum.photos/seed/ft-sydney/144/144",
  },
  {
    id: "cape-town",
    city: "Cape Town",
    country: "South Africa",
    airportIata: "CPT",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Cape_Town%2C_South_Africa.jpg/320px-Cape_Town%2C_South_Africa.jpg",
    imageFallbackUrl: "https://picsum.photos/seed/ft-capetown/144/144",
  },
];

const CLASS_MULTIPLIER: Record<TravelClass, number> = {
  economy: 1,
  premium_economy: 1.55,
  business: 3.1,
  first: 5.2,
};

function isSameCountry(fromIata: string, toIata: string): boolean {
  const from = findAirportByIata(fromIata);
  const to = findAirportByIata(toIata);
  if (!from?.country || !to?.country) return false;
  return from.country.toLowerCase() === to.country.toLowerCase();
}

/** Small per-route variation so identical distances don't look copy-pasted. */
function routeJitter(fromIata: string, toIata: string): number {
  const key = `${fromIata}${toIata}`;
  const hash = key.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return 0.96 + (hash % 9) * 0.01;
}

function snapFare(amount: number): number {
  return Math.max(79, Math.round(amount / 10) * 10 - 6);
}

/**
 * Economy base fare from great-circle distance.
 * Short domestic/regional routes are much cheaper than long-haul international.
 */
function economyBaseFareUsd(distanceKm: number, sameCountry: boolean): number {
  let fare: number;

  if (distanceKm < 700) {
    fare = 95 + distanceKm * 0.14;
  } else if (distanceKm < 2500) {
    fare = 145 + distanceKm * 0.09;
  } else if (distanceKm < 6000) {
    fare = 220 + distanceKm * 0.065;
  } else {
    fare = 350 + distanceKm * 0.048;
  }

  if (sameCountry) {
    fare *= 0.82;
  }

  return fare;
}

/** Distance-based demo fare in USD for a route and cabin. */
export function estimateDealPriceUsd(
  fromIata: string,
  destination: DestinationDeal,
  travelClass: TravelClass,
  promo = false,
): number {
  const distanceKm = airportDistanceKm(fromIata, destination.airportIata);

  let price: number;
  if (distanceKm == null) {
    price = 450;
  } else {
    const sameCountry = isSameCountry(fromIata, destination.airportIata);
    price = economyBaseFareUsd(distanceKm, sameCountry);
    price *= routeJitter(fromIata, destination.airportIata);
  }

  price *= CLASS_MULTIPLIER[travelClass];

  if (promo) {
    price *= 0.88;
  }

  return snapFare(price);
}

export function formatUsdPrice(amount: number): string {
  return `USD ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount)}`;
}

function shuffleDeals<T>(items: T[], seed: string): T[] {
  const result = [...items];
  let state = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);

  for (let i = result.length - 1; i > 0; i--) {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    const j = state % (i + 1);
    [result[i], result[j]] = [result[j]!, result[i]!];
  }

  return result;
}

export function dealsForOrigin(
  originIata: string,
  travelClass: TravelClass,
  promo = false,
  shuffleSalt = "",
): Array<DestinationDeal & { priceUsd: number }> {
  const deals = DESTINATION_CATALOG.filter((d) => d.airportIata !== originIata).map(
    (destination) => ({
      ...destination,
      priceUsd: estimateDealPriceUsd(originIata, destination, travelClass, promo),
    }),
  );

  return shuffleDeals(
    deals,
    `${originIata}-${travelClass}-${promo ? "promo" : "flights"}-${shuffleSalt}`,
  ).slice(0, 6);
}
