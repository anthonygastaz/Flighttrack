import Image from "next/image";

import { SKY_BLUE } from "@/lib/brand-colors";
import { cn } from "@/lib/utils";

interface AirplaneSilhouetteProps {
  className?: string;
  activeSection?: number;
}

/**
 * Section bands as % of the fuselage overlay box (not the full PNG).
 * Spans cockpit-to-door-4 window row; section 3 ends before the tail sweep.
 */
const SECTION_ZONES = [
  { id: 1, left: "2%", width: "30%" },
  { id: 2, left: "35%", width: "30%" },
  { id: 3, left: "68%", width: "30%" },
] as const;

/** Side-profile aircraft photo for the seat selection step. */
export function AirplaneSilhouette({ className, activeSection = 1 }: AirplaneSilhouetteProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl bg-white",
        className,
      )}
    >
      <div className="relative mx-auto h-[240px] w-full max-w-5xl sm:h-[300px] md:h-[340px]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-[130%] w-[130%] max-h-none max-w-none">
            <Image
              src="/plane-side-profile.png"
              alt=""
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1024px"
              className="object-contain object-center"
              aria-hidden
            />
          </div>
        </div>

        <div className="absolute left-[10%] top-[17%] h-[11%] w-[73%]">
          {SECTION_ZONES.map((zone) => {
            const isActive = activeSection === zone.id;
            return (
              <div
                key={zone.id}
                className={cn(
                  "pointer-events-none absolute inset-y-0 rounded-md transition-all duration-300",
                  isActive
                    ? "border-2 border-dashed"
                    : "bg-transparent",
                )}
                style={{
                  left: zone.left,
                  width: zone.width,
                  ...(isActive
                    ? { borderColor: SKY_BLUE, backgroundColor: `${SKY_BLUE}1a` }
                    : {}),
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
