import { Instrument_Serif, Inter } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
});
