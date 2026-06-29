import Image from "next/image";
import Link from "next/link";

import { APP_NAME, LOGO_ON_DARK_BG, LOGO_ON_LIGHT_BG } from "@/lib/brand";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  /** `on-dark` = white mark on navy/hero; `on-light` = blue mark on white; `adaptive` = follows site theme. */
  variant?: "on-dark" | "on-light" | "adaptive";
  showName?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  nameClassName?: string;
  href?: string | null;
  onClick?: () => void;
};

const LOGO_HEIGHT = { sm: 28, md: 36, lg: 44 } as const;

export function BrandLogo({
  variant = "on-dark",
  showName = true,
  size = "md",
  className,
  nameClassName,
  href = "/",
  onClick,
}: BrandLogoProps) {
  const height = LOGO_HEIGHT[size];
  const width = Math.round(height * (171 / 153));

  const mark =
    variant === "adaptive" ? (
      <>
        <Image
          src={LOGO_ON_LIGHT_BG}
          alt=""
          width={width}
          height={height}
          className="h-[var(--logo-h)] w-auto object-contain dark:hidden"
          style={{ "--logo-h": `${height}px` } as React.CSSProperties}
          priority
        />
        <Image
          src={LOGO_ON_DARK_BG}
          alt=""
          width={width}
          height={height}
          className="hidden h-[var(--logo-h)] w-auto object-contain dark:block"
          style={{ "--logo-h": `${height}px` } as React.CSSProperties}
          priority
        />
      </>
    ) : (
      <Image
        src={variant === "on-dark" ? LOGO_ON_DARK_BG : LOGO_ON_LIGHT_BG}
        alt=""
        width={width}
        height={height}
        className="h-[var(--logo-h)] w-auto shrink-0 object-contain"
        style={{ "--logo-h": `${height}px` } as React.CSSProperties}
        priority={variant === "on-dark"}
      />
    );

  const inner = (
    <>
      <span className="sr-only">{APP_NAME}</span>
      {mark}
      {showName && (
        <span className={cn("font-display text-xl font-semibold tracking-tight", nameClassName)}>
          {APP_NAME}
        </span>
      )}
    </>
  );

  if (href == null) {
    return <div className={cn("flex items-center gap-3", className)}>{inner}</div>;
  }

  return (
    <Link href={href} onClick={onClick} className={cn("flex items-center gap-3", className)}>
      {inner}
    </Link>
  );
}
