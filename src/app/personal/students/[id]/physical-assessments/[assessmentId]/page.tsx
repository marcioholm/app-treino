'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Scale, Ruler, Activity, Target, PencilLine, Trash2, Binary, ChevronDown, ChevronUp } from 'lucide-react';
import GradientButton from '@/components/trainer/GradientButton';
import { classifyBMI } from '@/lib/body-calculator';
import { cn } from '@/lib/utils';

export default function PhysicalAssessmentDetails({ params }: { params: Promise<{ id: string; assessmentId: string }> }) {
    const { id: studentId, assessmentId } = use(params);
    const router = useRouter();
    const [assessment, setAssessment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showBioimpedance, setShowBioimpedance] = useState(true);
    const [showMeasurements, setShowMeasurements] = useState(true);

    useEffect(() => {
        fetch(`/api/students/${studentId}/physical-assessments/${assessmentId}`)
            .then(res => res.json())
            .then(data => setAssessment(data.assessment))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [studentId, assessmentId]);

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.')) return;
        try {
            const res = await fetch(`/api/students/${studentId}/physical-assessments/${assessmentId}`, { method: 'DELETE' });
            if (res.ok) {
                router.push(`/personal/students/${studentId}/physical-assessments`);
            } else {
                const data = await res.json();
                alert(data.error || 'Erro ao excluir');
            }
        } catch (e: any) {
            alert(e.message || 'Erro ao excluir');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-8">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="size-12 rounded-2xl bg-white/5 border border-white/10 animate-spin" />
                    <p className="text-muted-foreground font-black text-xs uppercase tracking-widest">Carregando detalhes...</p>
                </div>
            </div>
        );
    }

    if (!assessment) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-8">
                <div className="text-center">
                    <h2 className="text-white font-display text-2xl font-black mb-4">Avaliação não encontrada</h2>
                    <Link href={`/personal/students/${studentId}/physical-assessments`}>
                        <GradientButton variant="outline">Voltar ao Histórico</GradientButton>
                    </Link>
                </div>
            </div>
        );
    }

    const bmiClass = classifyBMI(assessment.bmi);
    const m = assessment.bodyMeasurements?.[0] || {};

    const labelStyle = "px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5";
    const dataBox = "bg-white/5 border border-white/5 rounded-2xl px-6 py-5 flex flex-col justify-center min-h-[90px] group hover:bg-white/[0.08] transition-all";
    const dataValue = "font-display text-2xl font-black text-white tracking-tighter";

    return (
        <div className="min-h-screen bg-background pb-32 selection:bg-primary/30">
            {/* Header */}
            <section className="relative overflow-hidden pt-12 pb-16">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] -z-10" />
                
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <Link href={`/personal/students/${studentId}/physical-assessments`} className="inline-flex items-center gap-2.5 text-muted-foreground hover:text-white transition-all mb-10 group p-2 rounded-xl hover:bg-white/5">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-black text-[10px] uppercase tracking-widest">Ver Histórico</span>
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-fade-up">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="font-display text-4xl md:text-5xl font-black text-white tracking-tighter">{assessment.label}</h1>
                                <span className="px-3 py-1 rounded-full bg-success/10 border border-success/20 text-[9px] font-black text-success uppercase tracking-widest">Finalizada</span>
                            </div>
                            <p className="text-muted-foreground text-lg font-medium">Realizada em {new Date(assessment.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={handleDelete} className="size-14 rounded-2xl bg-red-500/10 border border-red-500/20 grid place-items-center text-red-500 hover:bg-red-500 hover:text-white transition-all group active:scale-95">
                                <Trash2 size={22} className="group-hover:scale-110 transition-transform" />
                            </button>
                            <Link href={`/personal/students/${studentId}/physical-assessments/edit/${assessmentId}`}>
                                <GradientButton size="lg" className="h-14 px-8">
                                    <PencilLine size={20} className="mr-2" strokeWidth={3} /> Editar Registro
                                </GradientButton>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 md:px-6 space-y-10 animate-fade-up stagger-1">
                {/* Vital Stats Card */}
                <div className="bg-glass rounded-[2.5rem] p-10 border border-white/5 shadow-2xl space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 size-64 bg-primary/5 rounded-full blur-[100px] -z-10 group-hover:bg-primary/10 transition-colors" />
                    
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 grid place-items-center text-primary-light">
                            <Activity size={24} />
                        </div>
                        <h2 className="font-display text-2xl font-black text-white tracking-tight">Dados Vitais</h2>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className={dataBox}>
                            <label className={labelStyle}>Peso</label>
                            <p className={dataValue}>{assessment.weight} <span className="text-xs text-muted-foreground ml-1">kg</span></p>
                        </div>
                        <div className={dataBox}>
                            <label className={labelStyle}>Altura</label>
                            <p className={dataValue}>{assessment.height} <span className="text-xs text-muted-foreground ml-1">cm</span></p>
                        </div>
                        <div className={cn(dataBox, "lg:col-span-2 border-primary/20 bg-primary/5")}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className={cn(labelStyle, "text-primary-light")}>IMC Analítico</label>
                                    <p className={dataValue}>{assessment.bmi ? assessment.bmi.toFixed(1) : '—'} <span className="text-xs text-muted-foreground ml-2 uppercase font-black tracking-widest">{bmiClass}</span></p>
                                </div>
                                <Binary size={32} className="text-primary-light/20" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bioimpedance Section */}
                <div className="bg-glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                    <button onClick={() => setShowBioimpedance(!showBioimpedance)} className="flex items-center justify-between w-full p-10 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-secondary/10 border border-secondary/20 grid place-items-center text-secondary-light">
                                <Target size={24} strokeWidth={2.5} />
                            </div>
                            <div className="text-left">
                                <h2 className="font-display text-2xl font-black text-white tracking-tight">Bioimpedância</h2>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Composição Corporal Completa</p>
                            </div>
                        </div>
                        <div className="size-10 rounded-xl bg-white/5 grid place-items-center text-muted-foreground">
                            {showBioimpedance ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                    </button>

                    {showBioimpedance && (
                        <div className="px-10 pb-10 space-y-10 animate-fade-in">
                            <div className="grid md:grid-cols-2 gap-6 bg-white/5 rounded-3xl p-6">
                                <div>
                                    <p className={labelStyle}>Equipamento</p>
                                    <p className="text-sm font-bold text-white">{assessment.bioimpedanceDevice || 'Não informado'}</p>
                                </div>
                                <div>
                                    <p className={labelStyle}>Condições</p>
                                    <p className="text-sm font-bold text-white">{assessment.conditions || 'Padrão'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    { l: '% Gordura', v: assessment.fatPercent, u: '%' },
                                    { l: 'Massa Gorda', v: assessment.fatMassKg, u: 'kg' },
                                    { l: 'Massa Magra', v: assessment.leanMassKg, u: 'kg' },
                                    { l: 'Massa Muscular', v: assessment.muscleMassKg, u: 'kg' },
                                    { l: 'Basal', v: assessment.basalMetabolism, u: 'kcal' },
                                    { l: 'Idade Metab.', v: assessment.metabolicAge, u: 'anos' },
                                ].map((stat, i) => (
                                    <div key={i} className={dataBox}>
                                        <label className={labelStyle}>{stat.l}</label>
                                        <p className={dataValue}>{stat.v || '—'} <span className="text-xs text-muted-foreground ml-1">{stat.u}</span></p>
                                    </div>
                                ))}
                            </div>

                            {/* Goals */}
                            <div className="pt-8 border-t border-white/5">
                                <h3 className="label-caps mb-6 opacity-40">Metas Estabelecidas</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { l: 'Meta Gordura', v: assessment.fatGoalPercent, u: '%' },
                                        { l: 'Meta Massa Musc.', v: assessment.muscleGoalKg, u: 'kg' },
                                        { l: 'Meta de Peso', v: assessment.weightGoalKg, u: 'kg' },
                                    ].map((goal, i) => (
                                        <div key={i} className="bg-primary/5 border border-primary/20 rounded-2xl px-6 py-4">
                                            <label className="text-[9px] font-black text-primary-light uppercase tracking-widest">{goal.l}</label>
                                            <p className="font-display font-black text-white text-xl">{goal.v || '—'} <span className="text-[10px] opacity-40 ml-1">{goal.u}</span></p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Measurements Section */}
                <div className="bg-glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                    <button onClick={() => setShowMeasurements(!showMeasurements)} className="flex items-center justify-between w-full p-10 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-success/10 border border-success/20 grid place-items-center text-success">
                                <Ruler size={24} strokeWidth={2.5} />
                            </div>
                            <div className="text-left">
                                <h2 className="font-display text-2xl font-black text-white tracking-tight">Perimetria</h2>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Circunferências Corporais</p>
                            </div>
                        </div>
                        <div className="size-10 rounded-xl bg-white/5 grid place-items-center text-muted-foreground">
                            {showMeasurements ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                    </button>

                    {showMeasurements && (
                        <div className="px-10 pb-10 space-y-12 animate-fade-in">
                            {[
                                { 
                                    group: 'Tronco', 
                                    fields: [
                                        { l: 'Pescoço', v: m.neckCm },
                                        { l: 'Ombro', v: m.shoulderCm },
                                        { l: 'Peitoral', v: m.chestCm },
                                        { l: 'Cintura', v: m.waistCm },
                                        { l: 'Abdômen', v: m.abdomenCm },
                                        { l: 'Quadril', v: m.hipCm }
                                    ]
                                },
                                { 
                                    group: 'Superiores', 
                                    fields: [
                                        { l: 'Braço D (R)', v: m.rightArmCm },
                                        { l: 'Braço E (R)', v: m.leftArmCm },
                                        { l: 'Braço D (C)', v: m.rightArmContractedCm },
                                        { l: 'Braço E (C)', v: m.leftArmContractedCm },
                                        { l: 'Ant.Braço D', v: m.rightForearmCm },
                                        { l: 'Ant.Braço E', v: m.leftForearmCm }
                                    ]
                                },
                                { 
                                    group: 'Inferiores', 
                                    fields: [
                                        { l: 'Coxa D', v: m.rightThighCm },
                                        { l: 'Coxa E', v: m.leftThighCm },
                                        { l: 'Pant. D', v: m.rightCalfCm },
                                        { l: 'Pant. E', v: m.leftCalfCm }
                                    ]
                                }
                            ].map((group) => (
                                <div key={group.group} className="space-y-6">
                                    <h3 className="label-caps px-4 opacity-40">{group.group}</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                                        {group.fields.map((f, i) => (
                                            <div key={i} className={cn(dataBox, "min-h-[80px] py-4 px-5")}>
                                                <label className={cn(labelStyle, "px-0")}>{f.l}</label>
                                                <p className="font-display font-bold text-white text-lg">{f.v || '—'} <span className="text-[10px] opacity-40 ml-0.5">cm</span></p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Notes */}
                {assessment.notes && (
                    <div className="bg-glass rounded-[2.5rem] p-10 border border-white/5 shadow-2xl">
                        <label className={labelStyle}>Notas Técnicas</label>
                        <p className="text-white font-medium leading-relaxed mt-4 italic opacity-80 whitespace-pre-wrap">"{assessment.notes}"</p>
                    </div>
                )}
            </div>
        </div>
    );
}
