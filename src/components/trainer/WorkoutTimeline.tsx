'use client';
import { AlertTriangle, Check, ClipboardList, Trophy, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, { icon: LucideIcon; color: string }> = {
  check: { icon: Check, color: "bg-success text-white" },
  trophy: { icon: Trophy, color: "bg-gradient-brand text-white" },
  clipboard: { icon: ClipboardList, color: "bg-secondary text-white" },
  alert: { icon: AlertTriangle, color: "bg-warning text-white" },
};

interface Item { 
  aluna: string; 
  evento: string; 
  tipo: keyof typeof iconMap; 
  tempo: string;
}

interface Props {
  items: Item[];
}

export function WorkoutTimeline({ items }: Props) {
  return (
    <div className="relative">
      <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-primary-light to-secondary rounded-full" />
      <ul className="space-y-5">
        {items.map((it, i) => {
          const { icon: Icon, color } = iconMap[it.tipo];
          const initials = it.aluna.split(" ").map(n => n[0]).slice(0, 2).join("");
          return (
            <li key={i} className="relative flex items-start gap-4">
              <div className={cn("relative z-10 grid place-items-center size-10 rounded-full ring-4 ring-background", color)}>
                <Icon size={18} />
              </div>
              <div className="flex-1 rounded-2xl bg-card border border-border/40 p-4 shadow-pink hover:shadow-pink-lg transition">
                <div className="flex items-center gap-2 mb-1">
                  <div className="size-7 rounded-full bg-gradient-brand text-primary-foreground grid place-items-center text-[10px] font-bold">{initials}</div>
                  <span className="font-semibold text-sm text-foreground">{it.aluna}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{it.tempo}</span>
                </div>
                <p className="text-sm text-muted-foreground pl-9">{it.evento}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}