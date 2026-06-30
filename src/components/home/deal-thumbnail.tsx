"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

interface DealThumbnailProps {
  city: string;
  imageUrl: string;
  imageFallbackUrl: string;
  className?: string;
}

export function DealThumbnail({
  city,
  imageUrl,
  imageFallbackUrl,
  className,
}: DealThumbnailProps) {
  const [src, setSrc] = useState(imageUrl);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center bg-gradient-to-br from-brand-green/20 to-brand-navy/10",
          className,
        )}
      >
        <MapPin className="size-6 text-brand-green/70" aria-hidden />
        <span className="sr-only">{city}</span>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Image
        src={src}
        alt={city}
        fill
        className="object-cover"
        sizes="72px"
        onError={() => {
          if (src !== imageFallbackUrl) {
            setSrc(imageFallbackUrl);
            return;
          }
          setFailed(true);
        }}
      />
    </div>
  );
}
