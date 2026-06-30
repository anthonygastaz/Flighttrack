"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createDemoBookingAction, seedDemoBookingsAction } from "@/server/actions/tracking-actions";

export function DemoBookingActions() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function createOne() {
    startTransition(async () => {
      const result = await createDemoBookingAction();
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success(`Demo booking created — ${result.data.reference}`);
      router.push(`/admin/bookings/${result.data.id}/edit`);
      router.refresh();
    });
  }

  function seedBatch() {
    startTransition(async () => {
      const result = await seedDemoBookingsAction(10);
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success(`Created ${result.data.created} demo bookings`);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={createOne}
        disabled={pending}
        size="sm"
        className="rounded-full bg-brand-orange text-white hover:bg-brand-orange/90"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
        Generate demo booking
      </Button>
      <Button
        onClick={seedBatch}
        disabled={pending}
        variant="outline"
        size="sm"
        className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
      >
        Seed 10 bookings
      </Button>
    </div>
  );
}
