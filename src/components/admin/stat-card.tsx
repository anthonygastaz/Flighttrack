import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: string;
  className?: string;
}

export function StatCard({ title, value, description, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn("admin-panel border-zinc-200/80", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-zinc-500">{title}</CardTitle>
        <div className="flex size-9 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="font-display text-3xl font-normal tracking-tight text-zinc-900">{value}</p>
        {description && <p className="mt-1 text-xs text-zinc-500">{description}</p>}
        {trend && <p className="mt-2 text-xs font-medium text-emerald-600">{trend}</p>}
      </CardContent>
    </Card>
  );
}
