'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Share2, Home, Trophy, Star, Heart, Flame } from 'lucide-react';
import MKLogo from '@/components/MKLogo';

interface Props {
    searchParams: Promise<{ result?: string }>;
}

const MOTIVATIONAL_PHRASES = [
    "Treino concluído, você está mais forte do que ontem! 💪",
    "Disciplina é a ponte entre metas e realizações. Parabéns! ✨",
    "Sua versão do futuro vai te agradecer por hoje. 🌟",
    "Não é apenas sobre estética, é sobre amor próprio e saúde. ❤️",
    "Cada gota de suor é um passo em direção ao seu objetivo. 🔥",
    "Você é sua única competição. E hoje você venceu! 🏆",
    "Mulheres fortes constroem caminhos incríveis. Continue! 👑",
    "O segredo do sucesso é a constância. Mais um check feito! ✅",
    "Respeite seu processo e celebre suas pequenas vitórias. 🌸",
    "M&K Fitness: Onde sua melhor versão ganha vida. 🏋️‍♀️"
];

export default function WorkoutCompletePage({ searchParams }: Props) {
    const params = use(searchParams);
    const router = useRouter();
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [phrase, setPhrase] = useState("");

    const triggerConfetti = useCallback(() => {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 },
            zIndex: 1000
        };

        function fire(particleRatio: number, opts: any) {
            (window as any).confetti?.({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
    }, []);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
        script.async = true;
        script.onload = triggerConfetti;
        document.body.appendChild(script);

        const fetchResult = async () => {
            const p = await params;
            if (!p.result) {
                router.push('/student');
                return;
            }
            try {
                const data = JSON.parse(atob(p.result));
                setResult(data);
                setPhrase(MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)]);
                if ((window as any).confetti) triggerConfetti();
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchResult();

        return () => {
            document.body.removeChild(script);
        };
    }, [params, router, triggerConfetti]);

    const handleShare = async () => {
        if (!result) return;
        const shareText = `Mais um treino concluído na M&K Fitness Center! 💪🏋️‍♀️\n\nTotal: ${result.totalSets} séries em ${result.durationMinutes} min.\n#MKFitnessCenter #TreinoFeminino #Arapoti`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Treino Concluído - M&K Fitness',
                    text: shareText,
                });
            } catch (e) {
                console.log('Share failed or cancelled');
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareText);
                alert('Resumo copiado para a área de transferência! ✨');
            } catch (e) {
                alert('Não foi possível compartilhar.');
            }
        }
    };

    if (loading || !result) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#D4537E]/20 border-t-[#D4537E] rounded-full animate-spin" />
                    <p className="text-gray-500 font-medium animate-pulse">Finalizando seu treino...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white p-6 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#D4537E]/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[250px] h-[250px] bg-[#D4537E]/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="w-full max-w-md space-y-10 relative z-10">
                {/* Logo and Icon */}
                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-3">
                        <MKLogo size="sm" />
                        <span className="text-xs text-[#D4537E] font-black uppercase tracking-[0.2em]">M&K Fitness Center</span>
                    </div>
                    
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#D4537E] blur-[40px] opacity-20 animate-pulse" />
                        <div className="w-24 h-24 bg-gradient-to-br from-[#D4537E] to-[#993556] rounded-[2.5rem] flex items-center justify-center shadow-2xl relative">
                            <Trophy size={48} className="text-white" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>

                {/* Celebration Message */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Arrasou, {result.studentName.split(' ')[0]}! 🏆
                    </h1>
                    <p className="text-lg font-medium text-pink-100 italic px-4 leading-relaxed">
                        "{phrase}"
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center space-y-2 backdrop-blur-sm">
                        <Flame className="text-orange-400 mb-1" size={24} />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Esforço Total</span>
                        <span className="text-3xl font-black tabular-nums">{result.totalSets}</span>
                        <span className="text-[10px] font-bold text-[#D4537E]">Séries Realizadas</span>
                    </div>
                    <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center space-y-2 backdrop-blur-sm">
                        <Star className="text-yellow-400 mb-1" size={24} />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tempo Ativo</span>
                        <span className="text-3xl font-black tabular-nums">{result.durationMinutes}</span>
                        <span className="text-[10px] font-bold text-[#D4537E]">Minutos de Treino</span>
                    </div>
                </div>

                {/* Volume (if available) */}
                {result.totalVolume > 0 && (
                    <div className="bg-gradient-to-r from-[#D4537E]/20 to-transparent border border-[#D4537E]/20 rounded-3xl p-6 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black text-[#D4537E] uppercase tracking-widest block mb-1">Carga Acumulada</span>
                            <span className="text-2xl font-black">{result.totalVolume.toLocaleString()} <span className="text-sm font-medium opacity-60">kg levantados</span></span>
                        </div>
                        <div className="size-12 rounded-2xl bg-[#D4537E]/10 flex items-center justify-center text-[#D4537E]">
                            <Flame size={24} />
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-4 pt-4">
                    <button
                        onClick={handleShare}
                        className="w-full h-16 bg-white text-black rounded-2xl font-black text-lg flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl"
                    >
                        <Share2 size={22} />
                        Compartilhar Progresso
                    </button>
                    
                    <Link
                        href="/student/today"
                        className="w-full h-16 bg-[#111111] border border-white/5 text-white/60 rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                        <Home size={20} />
                        Voltar ao Início
                    </Link>
                </div>

                <div className="text-center">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">M&K Fitness Center • Arapoti/PR</p>
                </div>
            </div>
        </div>
    );
}