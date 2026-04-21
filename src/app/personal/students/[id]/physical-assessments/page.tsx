'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, History, Activity, BarChart3, Trash2, Calendar, ChevronRight } from 'lucide-react';
import GradientButton from '@/components/trainer/GradientButton';
import { cn } from '@/lib/utils';

interface Assessment {
    id: string;
    date: string;
    label: string;
    weight: number | null;
    height: number | null;
    bmi: number | null;
    fatPercent: number | null;
    muscleMassKg: number | null;
}

export default function PhysicalAssessmentsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: studentId } = use(params);
    const router = useRouter();
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'history' | 'evolution' | 'compare'>('history');

    useEffect(() => {
        fetch(`/api/students/${studentId}/physical-assessments`)
            .then(res => res.json())
            .then(data => setAssessments(data.assessments || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [studentId]);

    const handleDelete = async (assessmentId: string) => {
        if (!confirm('Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.')) return;
        try {
            const res = await fetch(`/api/students/${studentId}/physical-assessments/${assessmentId}`, { method: 'DELETE' });
            if (res.ok) {
                setAssessments(assessments.filter(a => a.id !== assessmentId));
            } else {
                const data = await res.json();
                alert(data.error || 'Erro ao excluir');
            }
        } catch (e: any) {
            console.error(e);
            alert(e.message || 'Erro ao excluir');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-8">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="size-12 rounded-2xl bg-white/5 border border-white/10 animate-spin" />
                    <p className="text-muted-foreground font-black text-xs uppercase tracking-widest">Sincronizando Histórico...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-32 selection:bg-primary/30">
            {/* Header */}
            <section className="relative overflow-hidden pt-12 pb-16">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] -z-10" />
                
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <Link href={`/personal/students/${studentId}`} className="inline-flex items-center gap-2.5 text-muted-foreground hover:text-white transition-all mb-10 group p-2 rounded-xl hover:bg-white/5">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-black text-[10px] uppercase tracking-widest">Painel da Atleta</span>
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-fade-up">
                        <div>
                            <h1 className="font-display text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">Avaliações <span className="text-gradient-brand">Físicas</span></h1>
                            <p className="text-muted-foreground text-lg font-medium max-w-lg">Acompanhe a métrica de cada evolução e ajuste os treinos com precisão cirúrgica.</p>
                        </div>
                        <Link href={`/personal/students/${studentId}/physical-assessments/nova`}>
                            <GradientButton size="lg" className="shadow-pink-lg">
                                <Plus size={20} className="mr-2" strokeWidth={3} /> Nova Avaliação
                            </GradientButton>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Content Tabs */}
            <section className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="flex gap-2 overflow-x-auto bg-white/[0.03] p-1.5 rounded-[1.8rem] border border-white/5 mb-12 backdrop-blur-3xl no-scrollbar">
                    {[
                        { id: 'history', label: 'Histórico', icon: History },
                        { id: 'evolution', label: 'Evolução', icon: Activity },
                        { id: 'compare', label: 'Comparar', icon: BarChart3 }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex-1 min-w-[120px] px-6 h-12 rounded-2xl flex items-center justify-center gap-2.5 text-[11px] font-black uppercase tracking-widest transition-all duration-500",
                                activeTab === tab.id 
                                    ? "bg-gradient-brand text-white shadow-pink" 
                                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                            )}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'history' && (
                    <div className="space-y-6 animate-fade-up">
                        {assessments.length === 0 ? (
                            <div className="bg-glass-dark border border-white/5 rounded-[3rem] p-24 text-center">
                                <div className="size-20 rounded-[2rem] bg-white/5 grid place-items-center mx-auto mb-8 text-muted-foreground/30">
                                    <History size={40} />
                                </div>
                                <h3 className="font-display text-2xl font-black text-white mb-2">Nenhum registro</h3>
                                <p className="text-muted-foreground max-w-xs mx-auto mb-10">Sua atleta ainda não possui avaliações. Comece agora mesmo.</p>
                                <Link href={`/personal/students/${studentId}/physical-assessments/nova`}>
                                    <GradientButton variant="outline">
                                        Criar Primeira Avaliação
                                    </GradientButton>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-5">
                                {assessments.map((assessment, idx) => (
                                    <div 
                                        key={assessment.id} 
                                        className="group bg-glass border border-white/5 hover:border-white/10 rounded-[2.5rem] p-8 transition-all hover:bg-white/[0.02] relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 size-32 bg-primary/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                        
                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
                                            <div className="flex items-center gap-6">
                                                <div className="size-14 rounded-2xl bg-white/5 border border-white/10 grid place-items-center text-primary-light font-display font-black text-lg">
                                                    {assessments.length - idx}
                                                </div>
                                                <div>
                                                    <h3 className="font-display text-xl font-bold text-white group-hover:text-primary-light transition-colors">{assessment.label}</h3>
                                                    <div className="flex items-center gap-2.5 text-muted-foreground mt-1.5 font-bold text-[10px] uppercase tracking-widest">
                                                        <Calendar size={12} className="text-primary" />
                                                        {new Date(assessment.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 items-center gap-x-12 gap-y-4">
                                                {[
                                                    { label: 'Peso', val: assessment.weight, unit: 'kg' },
                                                    { label: 'IMC', val: assessment.bmi ? assessment.bmi.toFixed(1) : null, unit: '' },
                                                    { label: '% Gordura', val: assessment.fatPercent, unit: '%' },
                                                    { label: 'Massa Musc.', val: assessment.muscleMassKg, unit: 'kg' }
                                                ].map((stat, i) => stat.val && (
                                                    <div key={i}>
                                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">{stat.label}</p>
                                                        <p className="text-xl font-display font-black text-white">{stat.val}<span className="text-xs text-muted-foreground ml-1">{stat.unit}</span></p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-center gap-3 w-full md:w-auto">
                                                <Link 
                                                    href={`/personal/students/${studentId}/physical-assessments/${assessment.id}`}
                                                    className="flex-1 md:flex-none h-12 px-6 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-sm font-black text-white hover:bg-white/10 transition-all active:scale-95"
                                                >
                                                    Detalhes <ChevronRight size={16} className="ml-2" />
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(assessment.id)}
                                                    className="size-12 rounded-xl bg-red-500/10 border border-red-500/20 grid place-items-center text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95 group/del"
                                                >
                                                    <Trash2 size={18} className="group-hover/del:scale-110 transition-transform" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab !== 'history' && (
                    <div className="bg-glass-dark border border-white/5 rounded-[3rem] p-24 text-center animate-fade-up">
                        <div className="size-24 rounded-[2rem] bg-primary/5 grid place-items-center mx-auto mb-10 text-primary-light opacity-50">
                            <Activity size={48} className="animate-pulse" />
                        </div>
                        <h3 className="font-display text-3xl font-black text-white mb-4">Módulo Inteligente</h3>
                        <p className="text-muted-foreground text-lg max-w-sm mx-auto">Esta funcionalidade está sendo processada pela nossa rede neural para oferecer insights avançados de evolução.</p>
                        <div className="mt-10">
                            <GradientButton variant="outline" size="sm" className="px-10">Em breve</GradientButton>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}