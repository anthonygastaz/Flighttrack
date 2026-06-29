import type { BookingStatus } from "@/core/domain/enums";
import { BOOKING_STATUS_LABELS } from "@/core/domain/enums";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<BookingStatus, string> = {
  confirmed:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
  checked_in:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300",
  boarding:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
  departed:
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300",
  delayed:
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300",
  cancelled:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
  completed:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
};

interface StatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", STATUS_STYLES[status], className)}
    >
      {BOOKING_STATUS_LABELS[status]}
    </Badge>
  );
}
