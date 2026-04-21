'use client';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Camera, FileDown, PencilLine, Sparkles, Activity, Scale, Target, Ruler, ArrowLeft, ArrowDown, ArrowUp } from 'lucide-react';
import GradientButton from '@/components/trainer/GradientButton';
import MetricCard from '@/components/trainer/MetricCard';
import { cn } from '@/lib/utils';

interface Student {
    id: string;
    phone: string | null;
    user: { name: string; email: string; birthDate: string | null };
    assessments: { weight: number; height: number; bmi: number; bodyFatPercentage: number; muscleMass: number; waist: number; createdAt: string }[];
    goals: { objective: string; level: string; daysPerWeek: number }[];
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
                    goals: s.goals || []
                });
                setProfileForm({
                    name: s.user.name,
                    email: s.user.email,
                    phone: s.phone || '',
                    birthDate: s.user.birthDate ? new Date(s.user.birthDate).toISOString().split('T')[0] : ''
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
                setStudent(data.student);
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
        return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;
    }

    if (!student) {
        return <div className="p-8 text-center text-muted-foreground">Aluna não encontrada</div>;
    }

    const hasAssessment = student.assessments?.length > 0;
    const hasGoal = student.goals?.length > 0;
    const canGenerateMagic = hasAssessment && hasGoal;
    
    const latestAssessment = student.assessments[0];
    const goal = student.goals[0];
    const initials = student.user.name.split(' ').map(n => n[0]).slice(0, 2).join('');

    const tabs = ['Treino atual', 'Histórico', 'Avaliação física', 'Evolução'];

    const measures = latestAssessment ? [
        ['Peso', `${latestAssessment.weight} kg`],
        ['Altura', `${latestAssessment.height} cm`],
        ['IMC', `${latestAssessment.bmi}`],
        ['% Gordura', `${latestAssessment.bodyFatPercentage}%`],
        ['Massa muscular', `${latestAssessment.muscleMass} kg`],
        ['Cintura', `${latestAssessment.waist} cm`],
    ] : [
        ['Peso', '-'], ['Altura', '-'], ['IMC', '-'],
        ['% Gordura', '-'], ['Massa muscular', '-'], ['Cintura', '-'],
    ];

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Profile Header */}
            <section className="relative overflow-hidden pt-12 pb-24">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[40%] h-[100%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[30%] h-[80%] bg-secondary/5 rounded-full blur-[100px]" />
                
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <Link href="/personal/students" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-10 group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold text-sm tracking-tight">Voltar para alunas</span>
                    </Link>

                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
                        <div className="relative group">
                            <div className="size-32 md:size-40 rounded-[2.5rem] bg-glass-dark grid place-items-center font-display font-black text-5xl text-primary-light ring-4 ring-white/5 shadow-pink-lg transition-transform group-hover:scale-105 duration-500">
                                {initials}
                            </div>
                            <button className="absolute -bottom-2 -right-2 size-10 rounded-2xl bg-gradient-brand grid place-items-center shadow-pink border-4 border-background text-white hover:scale-110 transition-transform">
                                <Camera size={18} />
                            </button>
                        </div>

                        <div className="flex-1 min-w-0">
                            {editingProfile ? (
                                <div className="flex flex-col gap-4 max-w-md">
                                    <input
                                        type="text"
                                        value={profileForm.name}
                                        onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-display text-2xl font-bold focus:border-primary-light outline-none"
                                    />
                                    <div className="flex gap-3">
                                        <GradientButton size="sm" onClick={handleSaveProfile} disabled={savingProfile}>
                                            {savingProfile ? 'Salvando...' : 'Salvar Alterações'}
                                        </GradientButton>
                                        <GradientButton size="sm" variant="ghost" onClick={() => setEditingProfile(false)}>
                                            Cancelar
                                        </GradientButton>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-4 mb-3">
                                        <h1 className="font-display text-4xl md:text-5xl font-black text-white tracking-tight">{student.user.name}</h1>
                                        <button onClick={() => setEditingProfile(true)} className="size-10 rounded-xl bg-white/5 grid place-items-center text-muted-foreground hover:text-white hover:bg-white/10 transition-all">
                                            <PencilLine size={18} />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2.5">
                                        {goal ? (
                                            <>
                                                <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary-light uppercase tracking-wider">{goal.objective}</span>
                                                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-muted-foreground">Nível {goal.level}</span>
                                                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-muted-foreground">{goal.daysPerWeek}x semana</span>
                                            </>
                                        ) : (
                                            <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-muted-foreground italic">Sem objetivo definido</span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            <GradientButton variant="outline" onClick={handleMagicGenerate} disabled={!canGenerateMagic} className="flex-1 md:flex-none">
                                <Sparkles size={18} className="text-primary-light" /> IA Workout
                            </GradientButton>
                            <GradientButton variant="outline" className="flex-1 md:flex-none">
                                <FileDown size={18} /> Relatório
                            </GradientButton>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tab Navigation */}
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex gap-1.5 overflow-x-auto bg-white/5 p-1.5 rounded-[1.5rem] border border-white/10 no-scrollbar">
                    {tabs.map((t, i) => (
                        <button key={t} onClick={() => setTab(i)}
                            className={cn(
                                "flex-1 px-8 h-12 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300",
                                tab === i ? "bg-gradient-brand text-white shadow-pink translate-y-0" : "text-muted-foreground hover:text-white hover:bg-white/5"
                            )}>
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {tab === 2 && (
                <div className="container mx-auto px-4 md:px-6 mt-12 pb-24 space-y-12">
                    {/* Metrics Dashboard */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <MetricCard 
                            label="Peso" 
                            value={latestAssessment?.weight || '—'} 
                            unit="kg" 
                            iconName="scale" 
                            invertColor 
                        />
                        <MetricCard 
                            label="Gordura" 
                            value={latestAssessment?.bodyFatPercentage || '—'} 
                            unit="%" 
                            iconName="target" 
                            invertColor 
                        />
                        <MetricCard 
                            label="Massa Magra" 
                            value={latestAssessment?.muscleMass || '—'} 
                            unit="kg" 
                            iconName="activity" 
                        />
                        <MetricCard 
                            label="Cintura" 
                            value={latestAssessment?.waist || '—'} 
                            unit="cm" 
                            iconName="ruler" 
                            invertColor 
                        />
                    </div>

                    {/* Measurements Table Card */}
                    <div className="bg-glass rounded-[2rem] overflow-hidden border-white/5">
                        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div>
                                <h3 className="font-display font-bold text-xl text-white">Composição Corporal</h3>
                                <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-widest">Medidas e Perímetros</p>
                            </div>
                            {latestAssessment && (
                                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    Avaliado em: {new Date(latestAssessment.createdAt).toLocaleDateString('pt-BR')}
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-6 divide-x divide-y md:divide-y-0 divide-white/5">
                            {measures.map(([k, v]) => (
                                <div key={k} className="px-8 py-8 hover:bg-white/[0.02] transition-colors">
                                    <div className="label-caps mb-3">{k}</div>
                                    <div className="font-display font-black text-2xl text-white tracking-tight">{v}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Access Actions */}
                    <div className="flex gap-4 p-4 rounded-3xl bg-white/5 border border-white/10">
                        <Link href={`/personal/students/${id}/physical-assessments`} className="flex-1 text-center">
                            <GradientButton variant="ghost" className="w-full font-bold">
                                Ver Histórico Completo
                            </GradientButton>
                        </Link>
                        <Link href={`/personal/students/${id}/physical-assessments/nova`} className="flex-1">
                            <GradientButton className="w-full">
                                Realizar Nova Avaliação
                            </GradientButton>
                        </Link>
                    </div>
                </div>
            )}

            {tab !== 2 && (
                <div className="container mx-auto px-4 md:px-6 mt-16 pb-24">
                    <div className="bg-glass-dark rounded-[2.5rem] p-16 md:p-24 border-white/5 text-center backdrop-blur-3xl">
                        <div className="size-20 rounded-3xl bg-white/5 grid place-items-center mx-auto mb-8 text-muted-foreground">
                            <Activity size={40} className="opacity-20" />
                        </div>
                        <h3 className="font-display text-3xl font-black text-white mb-4 tracking-tight">Em Construção</h3>
                        <p className="text-muted-foreground text-lg max-w-sm mx-auto leading-relaxed">
                            A aba <span className="text-primary-light font-bold">"{tabs[tab]}"</span> está sendo aperfeiçoada para oferecer a melhor experiência possível.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}