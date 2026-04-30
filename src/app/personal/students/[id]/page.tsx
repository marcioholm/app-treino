'use client';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Camera, FileDown, PencilLine, Sparkles, Activity, Scale, Target, Ruler, ArrowLeft, ArrowDown, ArrowUp, ClipboardList, CheckCircle2 } from 'lucide-react';
import GradientButton from '@/components/trainer/GradientButton';
import MetricCard from '@/components/trainer/MetricCard';
import { cn } from '@/lib/utils';

interface Assessment {
    weight: number;
    height: number;
    bmi: number | null;
    createdAt: string;
}

interface PhysicalAssessment {
    date: string;
    weight: number | null;
    height: number | null;
    bmi: number | null;
    fatPercent: number | null;
    muscleMassPercent: number | null;
    bodyMeasurements: {
        waistCm: number | null;
    }[];
    createdAt: string;
}

interface AnamnesisAnswer {
    question: { 
        text: string; 
        type: string;
        section: { name: string };
    };
    answerText: string | null;
    answerArray: string[];
}

interface Student {
    id: string;
    phone: string | null;
    user: { name: string; email: string; birthDate: string | null };
    assessments: Assessment[];
    physicalAssessments: PhysicalAssessment[];
    anamnesisAnswers: AnamnesisAnswer[];
    goals: { objective: string; level: string; daysPerWeek: number }[];
    workouts: any[];
}

export default function StudentDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState(2);
    const [isGenerating, setIsGenerating] = useState(false);
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '', birthDate: '' });
    const [savingProfile, setSavingProfile] = useState(false);

    useEffect(() => {
        fetch(`/api/students/${id}`)
            .then(res => res.json())
            .then(data => {
                const s = data.student;
                setStudent({
                    ...s,
                    assessments: s.assessments || [],
                    physicalAssessments: s.physicalAssessments || [],
                    anamnesisAnswers: s.anamnesisAnswers || [],
                    goals: s.goals || [],
                    workouts: s.workouts || []
                });
                setProfileForm({
                    name: s?.user?.name || '',
                    email: s?.user?.email || '',
                    phone: s?.phone || '',
                    birthDate: s?.user?.birthDate ? new Date(s.user.birthDate).toISOString().split('T')[0] : ''
                });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        try {
            const res = await fetch(`/api/students/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: profileForm.name,
                    email: profileForm.email,
                    phone: profileForm.phone || null,
                    birthDate: profileForm.birthDate || null
                })
            });
            if (res.ok) {
                const data = await res.json();
                setStudent({
                    ...data.student,
                    anamnesisAnswers: data.student.anamnesisAnswers || []
                });
                setEditingProfile(false);
            } else {
                const err = await res.json();
                alert(err.error || 'Erro ao salvar');
            }
        } catch (e) {
            console.error(e);
            alert('Erro ao salvar');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleMagicGenerate = async () => {
        if (isGenerating) return;
        setIsGenerating(true);
        try {
            const res = await fetch(`/api/students/${id}/workouts/generate`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                router.push(`/personal/workouts/${data.workout?.id || 'new'}/editor?studentId=${id}`);
            } else {
                const err = await res.json();
                alert(`Erro ao gerar treino: ${err.error || 'Desconhecido'}`);
            }
        } catch (e: any) {
            console.error(e);
            alert(`Erro ao gerar treino: ${e.message || 'Erro de rede'}`);
        } finally {
            setIsGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 rounded-2xl bg-white/5 border border-white/10 animate-spin" />
                    <p className="text-muted-foreground font-bold animate-pulse">Carregando atleta...</p>
                </div>
            </div>
        );
    }

    if (!student) {
        return <div className="p-8 text-center text-muted-foreground">Aluna não encontrada</div>;
    }

    // Combined Data Logic
    const latestSimple = student.assessments?.[0];
    const latestPhysical = student.physicalAssessments?.[0];
    
    // Prioritize physical assessment for core stats if it's more recent
    const mainWeight = latestPhysical?.weight || latestSimple?.weight || null;
    const mainHeight = latestPhysical?.height || latestSimple?.height || null;
    const mainBmi = latestPhysical?.bmi || latestSimple?.bmi || null;
    
    const fatPercent = latestPhysical?.fatPercent || null;
    const muscleMass = latestPhysical?.muscleMassPercent || null;
    const waist = latestPhysical?.bodyMeasurements?.[0]?.waistCm || null;
    
    const lastUpdateDate = latestPhysical?.createdAt || latestSimple?.createdAt || null;

    const hasAssessment = student.physicalAssessments?.length > 0;
    const hasGoal = student.goals?.length > 0;
    const canGenerateMagic = hasAssessment && hasGoal;
    
    const goal = student.goals?.[0];
    const initials = student.user?.name ? student.user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '??';

    const tabs = ['Treino atual', 'Histórico', 'Avaliação física', 'Anamnese'];

    const formatBmi = (val: number | null) => {
        if (!val) return '—';
        return Number(val).toFixed(1);
    };

    const measures = [
        ['Peso', mainWeight ? `${mainWeight} kg` : '—'],
        ['Altura', mainHeight ? `${mainHeight} cm` : '—'],
        ['IMC', formatBmi(mainBmi)],
        ['% Gordura', fatPercent ? `${fatPercent}%` : '—'],
        ['Massa muscular', muscleMass ? `${muscleMass} kg` : '—'],
        ['Cintura', waist ? `${waist} cm` : '—'],
    ];

    // Group Anamnesis by Section
    const anamnesisBySection: Record<string, AnamnesisAnswer[]> = {};
    student.anamnesisAnswers.forEach(ans => {
        const sectionName = ans?.question?.section?.name || 'Geral';
        if (!anamnesisBySection[sectionName]) anamnesisBySection[sectionName] = [];
        anamnesisBySection[sectionName].push(ans);
    });

    return (
        <div className="min-h-screen bg-background pb-20 selection:bg-primary/30">
            {/* Profile Header */}
            <section className="relative overflow-hidden pt-12 pb-24 animate-fade-in">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] -z-10" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[100px] -z-10" />
                
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <Link href="/personal/students" className="inline-flex items-center gap-2.5 text-muted-foreground hover:text-white transition-all mb-12 group p-2 rounded-xl hover:bg-white/5">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-black text-[10px] uppercase tracking-widest">Painel de Alunas</span>
                    </Link>

                    <div className="flex flex-col md:flex-row gap-10 items-start md:items-end animate-fade-up">
                        <div className="relative group">
                            <div className="size-36 md:size-44 rounded-[2.5rem] bg-glass-dark grid place-items-center font-display font-black text-5xl text-primary-light ring-4 ring-white/5 shadow-pink-lg transition-all group-hover:scale-105 group-hover:rotate-1 duration-500 overflow-hidden relative">
                                {initials}
                                <div className="absolute inset-0 bg-gradient-brand opacity-0 group-hover:opacity-10 transition-opacity" />
                            </div>
                            <button className="absolute -bottom-3 -right-3 size-12 rounded-2xl bg-gradient-brand grid place-items-center shadow-pink-lg border-4 border-background text-white hover:scale-110 active:scale-95 transition-all">
                                <Camera size={20} strokeWidth={2.5} />
                            </button>
                        </div>

                        <div className="flex-1 min-w-0">
                            {editingProfile ? (
                                <div className="flex flex-col gap-4 max-w-md animate-fade-in">
                                    <input
                                        type="text"
                                        value={profileForm.name}
                                        onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-display text-3xl font-black focus:border-primary-light outline-none shadow-inner"
                                    />
                                    <div className="flex gap-3">
                                        <GradientButton size="sm" onClick={handleSaveProfile} disabled={savingProfile}>
                                            {savingProfile ? 'Processando...' : 'Salvar Atleta'}
                                        </GradientButton>
                                        <button onClick={() => setEditingProfile(false)} className="px-6 py-2.5 text-sm font-bold text-muted-foreground hover:text-white transition-colors">
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-4 mb-4">
                                        <h1 className="font-display text-5xl md:text-6xl font-black text-white tracking-tighter drop-shadow-2xl">{student.user?.name || 'Aluna'}</h1>
                                        <button onClick={() => setEditingProfile(true)} className="size-11 rounded-2xl bg-white/5 border border-white/10 grid place-items-center text-muted-foreground hover:text-primary-light hover:bg-white/10 transition-all hover:scale-110">
                                            <PencilLine size={20} />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {goal ? (
                                            <>
                                                <div className="px-5 py-2 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-2">
                                                    <Target size={14} className="text-primary-light" />
                                                    <span className="text-[11px] font-black text-primary-light uppercase tracking-widest">{goal.objective}</span>
                                                </div>
                                                <div className="px-5 py-2 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
                                                    <Activity size={14} className="text-secondary-light" />
                                                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Nível {goal.level}</span>
                                                </div>
                                                <div className="px-5 py-2 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
                                                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{goal.daysPerWeek}x / semana</span>
                                                </div>
                                            </>
                                        ) : (
                                            <span className="px-5 py-2 rounded-2xl bg-white/5 border border-white/5 text-[11px] font-bold text-muted-foreground italic uppercase tracking-widest">Sem metas ativas</span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex gap-4 w-full md:w-auto">
                            <GradientButton variant="outline" onClick={handleMagicGenerate} disabled={!canGenerateMagic || isGenerating} className="flex-1 md:flex-none h-14 px-8 border-white/5 text-sm font-black tracking-tight flex items-center justify-center">
                                <Sparkles size={20} className={cn("text-primary-light mr-2", isGenerating && "animate-spin")} /> 
                                {isGenerating ? 'Gerando...' : 'IA SmartWorkout'}
                            </GradientButton>
                            <button className="flex-1 md:flex-none size-14 rounded-2xl bg-white/5 border border-white/5 grid place-items-center text-white hover:bg-white/10 hover:border-white/20 transition-all group">
                                <FileDown size={22} className="group-hover:translate-y-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Quick Health Summary */}
                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-up stagger-1">
                        <div className={cn(
                            "p-6 rounded-[2rem] border backdrop-blur-md flex items-center justify-between group transition-all",
                            student.anamnesisAnswers.length > 0 
                                ? "bg-success/5 border-success/20" 
                                : "bg-amber-500/5 border-amber-500/20"
                        )}>
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "size-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                                    student.anamnesisAnswers.length > 0 ? "bg-success/10 text-success" : "bg-amber-500/10 text-amber-500"
                                )}>
                                    <ClipboardList size={22} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold">Anamnese</h4>
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">
                                        {student.anamnesisAnswers.length > 0 ? 'Preenchida e Ativa' : 'Pendente de Resposta'}
                                    </p>
                                </div>
                            </div>
                            {student.anamnesisAnswers.length > 0 ? (
                                <button onClick={() => setTab(3)} className="text-[10px] font-black text-primary-light uppercase tracking-widest hover:text-white transition-colors">Visualizar</button>
                            ) : (
                                <button className="bg-amber-500 text-black text-[10px] font-black px-4 py-2 rounded-xl hover:scale-105 active:scale-95 transition-all">SOLICITAR</button>
                            )}
                        </div>

                        <div className={cn(
                            "p-6 rounded-[2rem] border backdrop-blur-md flex items-center justify-between group transition-all",
                            student.physicalAssessments.length > 0 
                                ? "bg-primary/5 border-primary/20" 
                                : "bg-amber-500/5 border-amber-500/20"
                        )}>
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "size-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                                    student.physicalAssessments.length > 0 ? "bg-primary/10 text-primary-light" : "bg-amber-500/10 text-amber-500"
                                )}>
                                    <Scale size={22} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold">Avaliação Física</h4>
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">
                                        {student.physicalAssessments.length > 0 
                                            ? `Última: ${new Date(student.physicalAssessments[0].date).toLocaleDateString('pt-BR')}` 
                                            : 'Nenhuma Avaliação'}
                                    </p>
                                </div>
                            </div>
                            {student.physicalAssessments.length > 0 ? (
                                <button onClick={() => setTab(2)} className="text-[10px] font-black text-primary-light uppercase tracking-widest hover:text-white transition-colors">Visualizar</button>
                            ) : (
                                <Link href={`/personal/students/${id}/physical-assessments/nova`}>
                                    <button className="bg-primary text-white text-[10px] font-black px-4 py-2 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-pink">REALIZAR</button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* AI Performance Insight (Acompanhamento) */}
                    <div className="mt-6 animate-fade-up stagger-2">
                        <div className="bg-glass-dark border border-white/5 rounded-[2.5rem] overflow-hidden group">
                            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <Sparkles size={18} className="text-primary-light animate-pulse" />
                                    <h4 className="font-display font-black text-lg text-white tracking-tight uppercase">Diagnóstico de Performance</h4>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black text-primary-light uppercase tracking-widest">IA Real-Time</div>
                            </div>
                            <div className="p-8 flex flex-col md:flex-row gap-8 items-center">
                                <div className="flex-1">
                                    <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                                        Clique no botão abaixo para analisar o histórico recente de treinos, cargas e repetições desta aluna. A IA irá gerar um diagnóstico detalhado sobre a evolução dela.
                                    </p>
                                </div>
                                <Link href="/personal/performance">
                                    <GradientButton size="sm" className="whitespace-nowrap px-8 font-black text-xs tracking-widest">
                                        GERAR DIAGNÓSTICO
                                    </GradientButton>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tab Navigation */}
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex gap-2 overflow-x-auto bg-white/[0.03] p-2 rounded-[2rem] border border-white/5 no-scrollbar backdrop-blur-3xl shadow-2xl">
                    {tabs.map((t, i) => (
                        <button key={t} onClick={() => setTab(i)}
                            className={cn(
                                "flex-1 min-w-[140px] px-8 h-14 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-500",
                                tab === i 
                                    ? "bg-gradient-brand text-white shadow-pink-lg scale-[1.02] relative z-10" 
                                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                            )}>
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content: Physical Assessment */}
            {tab === 2 && (
                <div className="container mx-auto px-4 md:px-6 mt-16 pb-32 space-y-16 animate-fade-up">
                    {/* Metrics Dashboard */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <MetricCard 
                            label="Peso Corporal" 
                            value={mainWeight || '—'} 
                            unit="kg" 
                            iconName="scale" 
                            invertColor 
                        />
                        <MetricCard 
                            label="Percentual Gordura" 
                            value={fatPercent || '—'} 
                            unit="%" 
                            iconName="target" 
                            invertColor 
                        />
                        <MetricCard 
                            label="Massa Muscular" 
                            value={muscleMass || '—'} 
                            unit="kg" 
                            iconName="activity" 
                        />
                        <MetricCard 
                            label="Circunf. Cintura" 
                            value={waist || '—'} 
                            unit="cm" 
                            iconName="ruler" 
                            invertColor 
                        />
                    </div>

                    {/* Detailed Composition */}
                    <div className="group bg-glass rounded-[3rem] overflow-hidden border-white/5 hover:border-white/10 transition-all duration-700 shadow-2xl relative">
                        {/* Inner Gradient Blur */}
                        <div className="absolute top-0 right-0 size-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-colors" />
                        
                        <div className="px-10 py-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.01]">
                            <div>
                                <h3 className="font-display font-black text-3xl text-white tracking-tight">Composição Corporal</h3>
                                <p className="label-caps mt-2 opacity-60">Análise detalhada de perímetros e massa</p>
                            </div>
                            {lastUpdateDate && (
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Última Atualização</span>
                                        <span className="text-sm font-bold text-white">{new Date(lastUpdateDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                    <div className="size-12 rounded-2xl bg-success/10 border border-success/20 grid place-items-center text-success">
                                        <Activity size={20} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-6 divide-x divide-y md:divide-y-0 divide-white/5">
                            {measures.map(([k, v]) => (
                                <div key={k} className="px-10 py-12 hover:bg-white/[0.03] transition-all group/measure cursor-default">
                                    <div className="label-caps mb-4 group-hover/measure:text-primary-light transition-colors">{k}</div>
                                    <div className="font-display font-black text-3xl text-white tracking-tighter group-hover/measure:scale-110 origin-left transition-transform duration-500">{v}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="flex flex-col md:flex-row items-center gap-6 p-8 rounded-[2.5rem] bg-glass-dark border border-white/5 shadow-2xl">
                        <div className="flex-1 text-center md:text-left">
                            <h4 className="font-display text-xl font-black text-white">Evolução Contínua</h4>
                            <p className="text-muted-foreground text-sm font-medium mt-1">Mantenha os dados atualizados para melhores resultados gerados pela IA.</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4 w-full md:w-auto">
                            <Link href={`/personal/students/${id}/physical-assessments`} className="flex-1 md:flex-none">
                                <GradientButton variant="outline" className="w-full h-14 px-8 border-white/10 font-bold">
                                    Histórico Completo
                                </GradientButton>
                            </Link>
                            <Link href={`/personal/students/${id}/physical-assessments/nova`} className="flex-1 md:flex-none">
                                <GradientButton className="w-full h-14 px-10 shadow-pink-lg font-black text-sm tracking-tight scale-105 hover:scale-110 active:scale-95 transition-all">
                                    Nova Avaliação Física
                                </GradientButton>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Content: Anamnesis */}
            {tab === 3 && (
                <div className="container mx-auto px-4 md:px-6 mt-16 pb-32 animate-fade-up">
                    {Object.keys(anamnesisBySection).length === 0 ? (
                        <div className="bg-glass-dark rounded-[3rem] p-24 text-center border border-white/5">
                            <div className="size-20 rounded-[2rem] bg-white/5 grid place-items-center mx-auto mb-8 text-muted-foreground/30">
                                <ClipboardList size={40} />
                            </div>
                            <h3 className="font-display text-2xl font-black text-white mb-2">Anamnese não preenchida</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto">A aluna ainda não respondeu as perguntas iniciais de saúde e objetivos.</p>
                        </div>
                    ) : (
                        <div className="grid gap-10">
                            {Object.entries(anamnesisBySection).map(([section, answers]) => (
                                <div key={section} className="bg-glass rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl transition-all hover:border-white/10 group">
                                    <div className="px-10 py-8 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                                        <h3 className="font-display font-black text-2xl text-white tracking-tight">{section}</h3>
                                        <div className="size-10 rounded-xl bg-success/10 border border-success/20 grid place-items-center text-success">
                                            <CheckCircle2 size={20} />
                                        </div>
                                    </div>
                                    <div className="divide-y divide-white/5">
                                        {answers.map((ans, idx) => (
                                            <div key={idx} className="px-10 py-8 hover:bg-white/[0.02] transition-all grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="text-sm font-bold text-muted-foreground leading-relaxed uppercase tracking-widest text-[10px] opacity-60">{ans?.question?.text || 'Questão'}</div>
                                                <div className="text-lg font-bold text-white tracking-tight">
                                                    {ans?.question?.type === 'BOOLEAN' ? (
                                                        <span className={cn(
                                                            "px-4 py-1 rounded-lg text-xs font-black uppercase tracking-widest",
                                                            ans.answerText === 'true' ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-success/10 text-success border border-success/20"
                                                        )}>
                                                            {ans.answerText === 'true' ? 'Sim' : 'Não'}
                                                        </span>
                                                    ) : (
                                                        ans.answerText || ans.answerArray?.join(', ') || '—'
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Tab Content: Current Workout */}
            {tab === 0 && (
                <div className="container mx-auto px-4 md:px-6 mt-16 pb-32 animate-fade-up">
                    {student.workouts.length === 0 ? (
                        <div className="bg-glass-dark rounded-[3rem] p-24 text-center border border-white/5">
                            <div className="size-20 rounded-[2rem] bg-white/5 grid place-items-center mx-auto mb-8 text-muted-foreground/30">
                                <Sparkles size={40} />
                            </div>
                            <h3 className="font-display text-2xl font-black text-white mb-2">Nenhum treino ativo</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto mb-8">Use a IA SmartWorkout para gerar um planejamento personalizado.</p>
                            <GradientButton onClick={handleMagicGenerate} disabled={!canGenerateMagic || isGenerating}>
                                {isGenerating ? 'Gerando...' : 'Gerar com IA'}
                            </GradientButton>
                        </div>
                    ) : (
                        <div className="grid gap-10">
                            {student.workouts.filter(w => w.published).slice(0, 1).map((workout) => (
                                <div key={workout.id} className="bg-glass rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl transition-all hover:border-white/10 group">
                                    <div className="px-10 py-10 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-display font-black text-3xl text-white tracking-tight">{workout.name}</h3>
                                                <span className="px-3 py-1 rounded-full bg-success/10 border border-success/20 text-[10px] font-black text-success uppercase tracking-widest">Ativo</span>
                                            </div>
                                            <p className="label-caps opacity-60">Criado em {new Date(workout.createdAt).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                        <Link href={`/personal/workouts/${workout.id}/editor?studentId=${id}`}>
                                            <GradientButton variant="outline" size="sm">Editar Treino</GradientButton>
                                        </Link>
                                    </div>
                                    <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {workout.sessions.map((session: any) => (
                                            <div key={session.id} className="bg-white/5 rounded-3xl p-6 border border-white/5">
                                                <h4 className="font-display font-bold text-white mb-4 flex items-center justify-between">
                                                    {session.name}
                                                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{session.exercises.length} Exercícios</span>
                                                </h4>
                                                <div className="space-y-3">
                                                    {session.exercises.slice(0, 4).map((ex: any) => (
                                                        <div key={ex.id} className="text-xs text-muted-foreground flex items-center gap-2">
                                                            <div className="size-1.5 rounded-full bg-primary-light/50" />
                                                            {ex.exercise.name}
                                                        </div>
                                                    ))}
                                                    {session.exercises.length > 4 && (
                                                        <div className="text-[10px] text-primary-light font-black uppercase tracking-widest pt-2">+ {session.exercises.length - 4} outros</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Tab Content: History */}
            {tab === 1 && (
                <div className="container mx-auto px-4 md:px-6 mt-16 pb-32 animate-fade-up">
                    <div className="grid gap-6">
                        {student.workouts.length === 0 ? (
                            <div className="bg-glass-dark rounded-[3rem] p-24 text-center border border-white/5">
                                <h3 className="font-display text-2xl font-black text-white mb-2">Sem histórico</h3>
                                <p className="text-muted-foreground">O histórico de treinos aparecerá aqui conforme você criar novos ciclos.</p>
                            </div>
                        ) : (
                            student.workouts.map((workout) => {
                                const isAI = workout.name.startsWith('M&K:');
                                return (
                                    <div key={workout.id} className="bg-glass rounded-3xl p-8 border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className={cn(
                                                "size-14 rounded-2xl border border-white/5 grid place-items-center transition-colors",
                                                isAI ? "bg-primary/10 text-primary-light" : "bg-white/5 text-muted-foreground group-hover:text-white"
                                            )}>
                                                {isAI ? <Sparkles size={24} /> : <ClipboardList size={24} />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h4 className="font-display font-bold text-xl text-white">{workout.name}</h4>
                                                    {isAI && (
                                                        <span className="px-2 py-0.5 rounded-lg bg-primary/20 text-[9px] font-black text-primary-light uppercase tracking-widest border border-primary/20">IA SmartWorkout</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="text-xs text-muted-foreground font-medium">
                                                        {new Date(workout.createdAt).toLocaleDateString('pt-BR')} às {new Date(workout.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase tracking-widest",
                                                        workout.published ? "text-success" : "text-amber-500"
                                                    )}>
                                                        {workout.published ? 'Publicado' : 'Rascunho (IA)'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Link href={`/personal/workouts/${workout.id}/editor?studentId=${id}`}>
                                            <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/5 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all">
                                                Ver Detalhes
                                            </button>
                                        </Link>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Default Placeholder for other tabs (removed as we implemented all now) */}
        </div>
    );
}