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
    <div className="bg-glass rounded-[2rem] p-6 transition-all duration-500 hover:bg-white/[0.05] border-white/5 hover:border-white/10 group flex flex-col justify-between h-full min-h-[160px] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-12 -right-12 size-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
      
      <div className="flex items-center justify-between relative z-10">
        <span className="label-caps opacity-60 group-hover:opacity-100 transition-opacity">{label}</span>
        {Icon && (
          <div className="size-11 rounded-2xl bg-white/5 flex items-center justify-center text-primary-light ring-1 ring-white/5 transition-all group-hover:ring-white/20 group-hover:scale-110">
            <Icon size={20} strokeWidth={2.5} />
          </div>
        )}
      </div>

      <div className="mt-4 relative z-10">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="font-display text-4xl font-black text-white tracking-tight drop-shadow-sm">{value}</span>
          {unit && <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest translate-y-[-2px]">{unit}</span>}
        </div>
        
        {delta !== undefined && (
          <div className={cn(
            "mt-4 inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-xl border transition-all",
            good 
              ? "bg-green-500/10 text-green-400 border-green-500/20" 
              : isUp || isDown 
                ? "bg-red-500/10 text-red-400 border-red-500/20" 
                : "bg-white/5 text-muted-foreground border-white/10"
          )}>
            <div className={cn("size-1.5 rounded-full", good ? "bg-green-400" : "bg-red-400")} />
            {isUp && <ArrowUp size={12} strokeWidth={3} />}
            {isDown && <ArrowDown size={12} strokeWidth={3} />}
            {Math.abs(delta).toFixed(1)}{unit === '%' ? '' : ' '} {deltaLabel ?? ""}
          </div>
        )}
      </div>
    </div>
  );
}