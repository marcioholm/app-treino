'use client';
import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";
import GradientButton from "./GradientButton";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StudentCardProps {
  id: string;
  name: string;
  objetivo: string;
  imc: number;
  gordura: { atual: number; variacao: number };
  ultimaAvaliacao: string;
  peso?: { atual: number; variacao: number };
}

interface Props {
  aluna: StudentCardProps;
}

export default function StudentCard({ aluna }: Props) {
  const initials = aluna.name.split(" ").map(n => n[0]).slice(0, 2).join("");
  const progresso = Math.min(100, Math.abs(aluna.gordura.variacao) * 15);
  
  const isGorduraDown = aluna.gordura.variacao < 0;
  const gorduraColor = isGorduraDown ? "text-success" : "text-destructive";
  
  return (
    <div className="rounded-2xl bg-card p-5 shadow-pink border border-border/40 hover:shadow-pink-lg transition">
      <div className="flex items-center gap-3 mb-4">
        <div className="grid place-items-center size-14 rounded-full bg-gradient-brand text-primary-foreground font-display font-bold text-lg ring-2 ring-primary-light">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-display font-bold text-foreground truncate">{aluna.name}</h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-0.5 rounded-full bg-primary-soft text-primary font-semibold">{aluna.objetivo}</span>
            <span>IMC {aluna.imc}</span>
          </div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Gordura</span>
          <span className={gorduraColor}>
            {isGorduraDown ? <ArrowDown size={12} className="inline" /> : <ArrowUp size={12} className="inline" />}
            {' '}{Math.abs(aluna.gordura.variacao)}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-primary-soft overflow-hidden">
          <div className="h-full bg-gradient-brand rounded-full transition-all" style={{ width: `${progresso}%` }} />
        </div>
        <p className="text-xs text-muted-foreground">Última avaliação · {aluna.ultimaAvaliacao}</p>
      </div>
      <div className="flex gap-2">
        <Link href={`/personal/students/${aluna.id}`} className="flex-1">
          <GradientButton variant="outline" className="w-full" size="md">
            Ver perfil
          </GradientButton>
        </Link>
        <Link href={`/personal/students/${aluna.id}/physical-assessments`}>
          <GradientButton size="md">Avaliação</GradientButton>
        </Link>
      </div>
    </div>
  );
}