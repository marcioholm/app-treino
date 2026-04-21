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
    <div className="bg-glass rounded-[1.5rem] p-6 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:-translate-y-1 group">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div className="grid place-items-center size-14 rounded-full bg-gradient-brand text-primary-foreground font-display font-bold text-xl shadow-pink">
            {initials}
          </div>
          <div className="absolute -bottom-1 -right-1 size-5 bg-success rounded-full border-4 border-background" title="Ativa" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-display font-bold text-lg text-foreground truncate group-hover:text-primary-light transition-colors">{aluna.name}</h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary-light text-[10px] font-bold uppercase tracking-wider">{aluna.objetivo}</span>
            <span className="text-xs text-muted-foreground font-medium">IMC {aluna.imc || '—'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-1">
          <span className="label-caps block">Peso</span>
          <p className="text-xl font-display font-bold">{aluna.peso?.atual || '—'}<span className="text-xs ml-0.5 text-muted-foreground">kg</span></p>
        </div>
        <div className="space-y-1">
          <span className="label-caps block">Gordura</span>
          <div className="flex items-center gap-1.5">
            <p className="text-xl font-display font-bold">{aluna.gordura.atual || '—'}%</p>
            {aluna.gordura.variacao !== 0 && (
              <span className={cn("text-[10px] font-bold flex items-center px-1 rounded bg-opacity-10", isGorduraDown ? "bg-success text-success" : "bg-destructive text-destructive")}>
                {isGorduraDown ? <ArrowDown size={10} /> : <ArrowUp size={10} />}
                {Math.abs(aluna.gordura.variacao)}%
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex justify-between items-end">
          <span className="text-xs font-medium text-muted-foreground">Aderência ao plano</span>
          <span className="text-xs font-bold text-primary-light">{progresso}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full bg-gradient-brand rounded-full transition-all duration-1000" style={{ width: `${progresso}%` }} />
        </div>
      </div>

      <div className="flex gap-2">
        <Link href={`/personal/students/${aluna.id}`} className="flex-1">
          <GradientButton variant="outline" className="w-full" size="sm">
            Ver perfil
          </GradientButton>
        </Link>
        <Link href={`/personal/students/${aluna.id}/physical-assessments`}>
          <GradientButton className="w-full" size="sm">
            Avaliar
          </GradientButton>
        </Link>
      </div>
    </div>
  );
}