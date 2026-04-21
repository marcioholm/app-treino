'use client';

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ArrowDown, ArrowUp, LucideIcon, Activity, Dumbbell, ClipboardCheck, Users, Trophy, TrendingUp, Scale, Target, Ruler } from "lucide-react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const iconMap: Record<string, LucideIcon> = {
  activity: Activity,
  dumbbell: Dumbbell,
  clipboard: ClipboardCheck,
  users: Users,
  trophy: Trophy,
  trending: TrendingUp,
  scale: Scale,
  target: Target,
  ruler: Ruler
};

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  deltaLabel?: string;
  invertColor?: boolean;
  iconName?: keyof typeof iconMap;
}

export default function MetricCard({ label, value, unit, delta, deltaLabel, invertColor, iconName }: Props) {
  const isUp = delta !== undefined && delta > 0;
  const isDown = delta !== undefined && delta < 0;
  const good = invertColor ? isDown : isUp;
  const Icon = iconName ? iconMap[iconName] : null;
  
  return (
    <div className="bg-glass rounded-2xl p-5 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] group">
      <div className="flex items-start justify-between mb-4">
        <span className="label-caps">{label}</span>
        {Icon && (
          <span className="grid place-items-center size-10 rounded-xl bg-primary-soft/10 text-primary transition-transform group-hover:scale-110">
            <Icon size={20} />
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-4xl font-bold tracking-tight text-foreground">{value}</span>
        {unit && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
      </div>
      {delta !== undefined && (
        <div className={cn("mt-3 inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full",
          good ? "bg-success/10 text-success" : isUp || isDown ? "bg-destructive/10 text-destructive" : "bg-white/5 text-muted-foreground")}>
          {isUp && <ArrowUp size={14} />}
          {isDown && <ArrowDown size={14} />}
          {Math.abs(delta).toFixed(1)} {deltaLabel ?? ""}
        </div>
      )}
    </div>
  );
}