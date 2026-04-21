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
        <div className="min-h-screen bg-surface-alt pb-16">
            {/* Profile header */}
            <section className="relative bg-dark text-white">
                <div className="absolute inset-0 bg-gradient-brand opacity-70" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
                <div className="container mx-auto px-4 md:px-6 py-10 relative">
                    <Link href="/personal/students" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6">
                        <ArrowLeft size={16} /> Voltar
                    </Link>
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
                        <div className="size-24 rounded-2xl bg-card text-primary grid place-items-center font-display font-bold text-3xl ring-4 ring-primary-light shadow-pink-lg">
                            {initials}
                        </div>
                        <div className="flex-1">
                            {editingProfile ? (
                                <div className="flex gap-4 flex-wrap">
                                    <input
                                        type="text"
                                        value={profileForm.name}
                                        onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                                        className="bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white"
                                    />
                                    <button onClick={handleSaveProfile} disabled={savingProfile} className="bg-white/20 px-4 py-2 rounded-lg">
                                        {savingProfile ? 'Salvando...' : 'Salvar'}
                                    </button>
                                    <button onClick={() => setEditingProfile(false)} className="text-white/70 px-4 py-2">Cancelar</button>
                                </div>
                            ) : (
                                <>
                                    <h1 className="font-display text-3xl font-bold">{student.user.name}</h1>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {goal && (
                                            <>
                                                <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-semibold">{goal.objective}</span>
                                                <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-semibold">Nível {goal.level}</span>
                                                <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-semibold">{goal.daysPerWeek}x semana</span>
                                            </>
                                        )}
                                        {!goal && <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-semibold">Sem objetivo definido</span>}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {!editingProfile && (
                                <GradientButton variant="ghost-light" onClick={() => setEditingProfile(true)}>
                                    <PencilLine size={16} /> Editar
                                </GradientButton>
                            )}
                            <GradientButton variant="ghost-light" onClick={handleMagicGenerate} disabled={!canGenerateMagic}>
                                <Sparkles size={16} /> Gerar treino
                            </GradientButton>
                            <GradientButton variant="ghost-light">
                                <FileDown size={16} /> PDF
                            </GradientButton>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tabs */}
            <div className="container mx-auto px-4 md:px-6 mt-6">
                <div className="flex gap-1 overflow-x-auto bg-card rounded-2xl p-1.5 shadow-pink border border-border/40">
                    {tabs.map((t, i) => (
                        <button key={t} onClick={() => setTab(i)}
                            className={cn(
                                "px-4 h-11 rounded-xl text-sm font-semibold whitespace-nowrap transition",
                                tab === i ? "bg-gradient-brand text-primary-foreground shadow-pink" : "text-muted-foreground hover:text-foreground"
                            )}>
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {tab === 2 && (
                <div className="container mx-auto px-4 md:px-6 mt-8 pb-16 space-y-8">
                    {/* Metrics */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard 
                            label="Peso" 
                            value={latestAssessment?.weight || '-'} 
                            unit="kg" 
                            iconName="scale" 
                            invertColor 
                        />
                        <MetricCard 
                            label="% Gordura" 
                            value={latestAssessment?.bodyFatPercentage || '-'} 
                            unit="%" 
                            iconName="target" 
                            invertColor 
                        />
                        <MetricCard 
                            label="Massa muscular" 
                            value={latestAssessment?.muscleMass || '-'} 
                            unit="kg" 
                            iconName="activity" 
                        />
                        <MetricCard 
                            label="Cintura" 
                            value={latestAssessment?.waist || '-'} 
                            unit="cm" 
                            iconName="ruler" 
                            invertColor 
                        />
                    </div>

                    {/* Measurements table */}
                    <div className="rounded-2xl bg-card shadow-pink border border-border/40 overflow-hidden">
                        <div className="p-5 border-b border-border/40 flex items-center justify-between">
                            <h3 className="font-display font-bold text-lg">Medidas corporais</h3>
                            {latestAssessment && (
                                <span className="text-xs text-muted-foreground">
                                    Última: {new Date(latestAssessment.createdAt).toLocaleDateString('pt-BR')}
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-border/40">
                            {measures.map(([k, v]) => (
                                <div key={k} className="bg-card px-4 py-3">
                                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{k}</div>
                                    <div className="font-display font-bold text-lg">{v}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <Link href={`/personal/students/${id}/physical-assessments`}>
                            <GradientButton variant="outline">
                                Ver Histórico de Avaliações
                            </GradientButton>
                        </Link>
                        <Link href={`/personal/students/${id}/physical-assessments/nova`}>
                            <GradientButton>
                                Nova Avaliação
                            </GradientButton>
                        </Link>
                    </div>
                </div>
            )}

            {tab !== 2 && (
                <div className="container mx-auto px-4 md:px-6 mt-12 pb-16">
                    <div className="rounded-2xl bg-card shadow-pink border border-border/40 p-12 text-center">
                        <p className="text-muted-foreground">Aba "{tabs[tab]}" — conteúdo em construção.</p>
                    </div>
                </div>
            )}
        </div>
    );
}