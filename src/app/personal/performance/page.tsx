import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { getAllTenantInsights } from '@/lib/engine/performance';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';

export default async function PerformancePage() {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('mk_app_token')?.value;
    const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

    if (!payload || (payload.role !== 'TRAINER' && payload.role !== 'OWNER_PERSONAL')) {
        return <div className="p-6 text-red-500">Acesso negado.</div>;
    }

    const insights = await getAllTenantInsights(payload.tenantId);

    const typeConfig = {
        EVOLUTION: { icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
        ATTENTION: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
        WARNING: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
        NEUTRAL: { icon: Lightbulb, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
    };

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary-light">
                        <Brain size={24} />
                    </div>
                    <h1 className="font-display text-4xl font-black text-white tracking-tight">IA de Performance</h1>
                </div>
                <p className="text-muted-foreground font-medium text-lg">Diagnóstico inteligente e insights automáticos das suas alunas.</p>
            </div>

            {insights.length === 0 ? (
                <div className="bg-glass rounded-[2.5rem] p-12 text-center border border-white/5">
                    <div className="size-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                        <Brain size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Sem diagnósticos ainda</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">Aguardando as alunas concluírem os primeiros treinos para gerar insights.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {insights.map((insight, idx) => {
                        const config = typeConfig[insight.type] || typeConfig.NEUTRAL;
                        const Icon = config.icon;

                        return (
                            <div 
                                key={idx}
                                className={`bg-glass-dark rounded-[2.5rem] border ${config.border} p-8 hover:bg-white/[0.04] transition-all group relative overflow-hidden`}
                            >
                                {/* Decorative Gradient */}
                                <div className={`absolute -top-24 -right-24 size-48 ${config.bg} rounded-full blur-[80px] opacity-50`} />

                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg leading-none">{insight.studentName}</h4>
                                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-2 block">Diagnóstico em tempo real</span>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full ${config.bg} ${config.color} text-[10px] font-black uppercase tracking-widest border ${config.border}`}>
                                        {insight.type === 'EVOLUTION' ? 'Evolução' : insight.type === 'ATTENTION' ? 'Atenção' : insight.type === 'WARNING' ? 'Crítico' : 'Info'}
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8 relative z-10">
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 size-8 rounded-lg ${config.bg} flex items-center justify-center ${config.color} shrink-0`}>
                                            <Icon size={18} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-2">{insight.title}</h3>
                                            <p className="text-muted-foreground leading-relaxed font-medium">{insight.description}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 relative z-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Lightbulb size={16} className="text-primary-light" />
                                        <span className="text-[10px] font-black text-primary-light uppercase tracking-widest">Sugestão da IA</span>
                                    </div>
                                    <p className="text-white font-bold leading-relaxed">{insight.suggestion}</p>
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <Link 
                                        href={`/personal/students/${insight.studentId}`}
                                        className="flex items-center gap-2 text-xs font-black text-primary-light hover:text-white transition-colors group/link"
                                    >
                                        VER PERFIL COMPLETO
                                        <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
