'use client';
import { ArrowDown, ArrowUp, LucideIcon } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  deltaLabel?: string;
  invertColor?: boolean;
  icon?: LucideIcon;
}

export default function MetricCard({ label, value, unit, delta, deltaLabel, invertColor, icon: Icon }: Props) {
  const isUp = delta !== undefined && delta > 0;
  const isDown = delta !== undefined && delta < 0;
  const good = invertColor ? isDown : isUp;
  
  return (
    <div className="rounded-2xl bg-card p-5 shadow-pink border border-border/40 transition hover:shadow-pink-lg">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{label}</span>
        {Icon && (
          <span className="grid place-items-center size-9 rounded-xl bg-primary-soft text-primary">
            <Icon size={18} />
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-display text-3xl font-bold text-foreground">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      {delta !== undefined && (
        <div className={cn("mt-2 inline-flex items-center gap-1 text-xs font-semibold",
          good ? "text-success" : isUp || isDown ? "text-destructive" : "text-muted-foreground")}>
          {isUp && <ArrowUp size={14} />}
          {isDown && <ArrowDown size={14} />}
          {Math.abs(delta).toFixed(1)} {deltaLabel ?? ""}
        </div>
      )}
    </div>
  );
}