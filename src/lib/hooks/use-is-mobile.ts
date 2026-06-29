"use client";

import { useEffect, useState } from "react";

/** Matches Tailwind `md` breakpoint (viewport width &lt; 768px). */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isMobile;
}
