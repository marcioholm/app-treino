'use client';
import Link from 'next/link';
import { PencilLine, Activity, Target, Scale, ChevronRight } from 'lucide-react';
import GradientButton from './GradientButton';

interface StudentCardProps {
    aluna: {
        id: string;
        name: string;
        objetivo: string;
        ultimaAvaliacao?: string;
        peso: { atual: number; variacao: number };
        gordura: { atual: number; variacao: number };
        imc: number;
        adherence?: number;
    };
}

export default function StudentCard({ aluna }: StudentCardProps) {
    const initials = aluna.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    const adherence = aluna.adherence ?? 0;

    return (
        <div className="group relative bg-glass rounded-[2.5rem] border-white/5 transition-all duration-500 hover:bg-white/[0.06] hover:border-white/10 hover:-translate-y-2 p-8 flex flex-col justify-between h-full shadow-2xl overflow-hidden animate-fade-up">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 size-40 bg-primary/5 rounded-full blur-[100px] group-hover:bg-primary/10 transition-colors -z-10" />
            
            <div className="flex items-start justify-between mb-8">
                <div className="flex gap-5 items-center">
                    <div className="size-16 rounded-[1.25rem] bg-glass-dark border border-white/10 flex items-center justify-center font-display font-black text-2xl text-primary-light shadow-pink ring-1 ring-white/5 group-hover:scale-110 transition-transform duration-500">
                        {initials}
                    </div>
                    <div>
                        <h3 className="font-display text-xl font-black text-white hover:text-primary-light transition-colors leading-tight">
                            {aluna.name}
                        </h3>
                        <p className="label-caps mt-1 inline-block bg-primary/10 px-2 py-0.5 rounded text-[9px] border border-primary/20">{aluna.objetivo || 'Fase Inicial'}</p>
                    </div>
                </div>
                <Link href={`/personal/students/${aluna.id}`}>
                    <button className="size-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
                        <PencilLine size={18} />
                    </button>
                </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 rounded-3xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <Scale size={14} className="text-primary-light" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Peso</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-display font-black text-white">{aluna.peso.atual || '--'}</span>
                        <span className="text-[10px] font-bold text-muted-foreground">kg</span>
                    </div>
                </div>
                <div className="bg-white/5 rounded-3xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <Target size={14} className="text-secondary-light" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Gordura</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-display font-black text-white">{aluna.gordura.atual || '--'}</span>
                        <span className="text-[10px] font-bold text-muted-foreground">%</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Activity size={14} className="text-primary-light" /> Aderência
                    </span>
                    <span className="text-xs font-black text-white">{adherence}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                    <div 
                        className="h-full bg-gradient-brand rounded-full transition-all duration-1000 shadow-pink" 
                        style={{ width: `${adherence}%` }}
                    />
                </div>
            </div>

            <div className="flex gap-3 mt-auto">
                <Link href={`/personal/students/${aluna.id}`} className="flex-1">
                    <GradientButton variant="ghost" className="w-full h-12 font-black text-sm tracking-tight border-white/5">
                        Ver Perfil
                    </GradientButton>
                </Link>
                <Link href={`/personal/students/${aluna.id}/physical-assessments/nova`}>
                    <button className="size-12 rounded-2xl bg-gradient-brand flex items-center justify-center text-white shadow-pink hover:scale-105 active:scale-95 transition-all">
                        <Target size={20} strokeWidth={2.5} />
                    </button>
                </Link>
            </div>
        </div>
    );
}