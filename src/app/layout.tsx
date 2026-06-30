import type { Metadata } from "next";

import { APP_NAME } from "@/lib/brand";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { instrumentSerif, inter } from "@/lib/fonts";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Track Your Flight Booking`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "Track flight bookings by reference number. Premium flight tracking for your itineraries.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${inter.variable} ${instrumentSerif.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryProvider>
            {children}
            <Toaster richColors position="top-right" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
