'use client';
import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Target, Activity, Scale, Save, Sparkles, Binary } from 'lucide-react';
import GradientButton from '@/components/trainer/GradientButton';
import { calculateBMI, classifyBMI } from '@/lib/body-calculator';
import { cn } from '@/lib/utils';

export default function StudentAssessment({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [studentName, setStudentName] = useState('Aluna');
    
    const [formData, setFormData] = useState({
        weight: '',
        height: '',
        goal: 'HIPERTROFIA',
        level: 'INTERMEDIARIO'
    });

    useEffect(() => {
        fetch(`/api/students/${id}`)
            .then(res => res.json())
            .then(data => {
                setStudentName(data.student?.user?.name || 'Aluna');
                if (data.student?.physicalAssessments?.[0]) {
                    const last = data.student.physicalAssessments[0];
                    setFormData(prev => ({
                        ...prev,
                        weight: last.weight?.toString() || '',
                        height: last.height?.toString() || ''
                    }));
                } else if (data.student?.assessments?.[0]) {
                    const last = data.student.assessments[0];
                    setFormData(prev => ({
                        ...prev,
                        weight: last.weight?.toString() || '',
                        height: last.height?.toString() || ''
                    }));
                }
                
                if (data.student?.goals?.[0]) {
                    const goal = data.student.goals[0];
                    setFormData(prev => ({
                        ...prev,
                        goal: goal.objective,
                        level: goal.level
                    }));
                }
            })
            .catch(console.error);
    }, [id]);

    const bmiValue = calculateBMI(
        formData.weight ? parseFloat(formData.weight) : null,
        formData.height ? parseFloat(formData.height) : null
    );
    const bmiClass = classifyBMI(bmiValue);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`/api/students/${id}/assessment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    weight: parseFloat(formData.weight),
                    height: parseFloat(formData.height),
                    goal: formData.goal,
                    level: formData.level
                })
            });

            if (res.ok) {
                router.push(`/personal/students/${id}`);
                router.refresh();
            } else {
                const err = await res.json();
                alert(`Erro ao salvar: ${err.error || 'Desconhecido'}`);
            }
        } catch (e) {
            console.error(e);
            alert('Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    const inputWrapper = "space-y-2";
    const labelStyle = "px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest";
    const inputStyle = "w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white font-bold focus:border-primary-light focus:bg-white/[0.08] transition-all outline-none placeholder:text-white/20 placeholder:font-medium";
    const selectStyle = "w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white font-bold focus:border-primary-light focus:bg-white/[0.08] transition-all outline-none appearance-none cursor-pointer";

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Header Section */}
            <section className="relative overflow-hidden pt-12 pb-12">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] -z-10" />
                
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <Link href={`/personal/students/${id}`} className="inline-flex items-center gap-2.5 text-muted-foreground hover:text-white transition-all mb-10 group p-2 rounded-xl hover:bg-white/5">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-black text-[10px] uppercase tracking-widest">Perfil de {studentName}</span>
                    </Link>

                    <h1 className="font-display text-4xl md:text-5xl font-black text-white tracking-tighter animate-fade-up">
                        Definir <span className="text-gradient-brand">Metas & Objetivos</span>
                    </h1>
                </div>
            </section>

            <form onSubmit={handleSubmit} className="container mx-auto px-4 md:px-6 max-w-4xl space-y-10 animate-fade-up stagger-1">
                {/* Physical Base */}
                <div className="bg-glass rounded-[2.5rem] p-10 border border-white/5 shadow-2xl space-y-10">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 grid place-items-center text-primary-light">
                            <Scale size={24} />
                        </div>
                        <div>
                            <h2 className="font-display text-2xl font-black text-white tracking-tight">Dados Vitais</h2>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Base para cálculo de intensidade</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className={inputWrapper}>
                            <label className={labelStyle}>Peso Atual (kg)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={formData.weight}
                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                placeholder="00.0"
                                className={inputStyle}
                            />
                        </div>
                        <div className={inputWrapper}>
                            <label className={labelStyle}>Altura (cm ou m)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={formData.height}
                                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                placeholder="170 ou 1.70"
                                className={inputStyle}
                            />
                        </div>
                    </div>

                    {bmiValue && (
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-8 flex items-center justify-between group overflow-hidden relative">
                            <div className="absolute top-0 right-0 size-32 bg-primary/10 rounded-full blur-[60px] -z-10 group-hover:bg-primary/20 transition-colors" />
                            <div>
                                <p className="text-[10px] font-black text-primary-light uppercase tracking-widest mb-1.5">IMC Analítico</p>
                                <div className="flex items-baseline gap-3">
                                    <span className="font-display text-4xl font-black text-white leading-none">{bmiValue}</span>
                                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{bmiClass}</span>
                                </div>
                            </div>
                            <Binary size={40} className="text-white/5" />
                        </div>
                    )}
                </div>

                {/* Goals Selection */}
                <div className="bg-glass rounded-[2.5rem] p-10 border border-white/5 shadow-2xl space-y-10">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-secondary/10 border border-secondary/20 grid place-items-center text-secondary-light">
                            <Target size={24} />
                        </div>
                        <div>
                            <h2 className="font-display text-2xl font-black text-white tracking-tight">Planejamento IA</h2>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Direcionamento para o SmartWorkout</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className={inputWrapper}>
                            <label className={labelStyle}>Objetivo Principal</label>
                            <div className="relative">
                                <select
                                    className={selectStyle}
                                    value={formData.goal}
                                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                >
                                    <option value="HIPERTROFIA">Hipertrofia (Ganho de Massa)</option>
                                    <option value="EMAGRECIMENTO">Emagrecimento (Perda de Gordura)</option>
                                    <option value="DEFINICAO">Definição Muscular</option>
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                    <ArrowLeft size={16} className="-rotate-90" />
                                </div>
                            </div>
                        </div>

                        <div className={inputWrapper}>
                            <label className={labelStyle}>Nível de Experiência</label>
                            <div className="relative">
                                <select
                                    className={selectStyle}
                                    value={formData.level}
                                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                >
                                    <option value="INICIANTE">Iniciante</option>
                                    <option value="INTERMEDIARIO">Intermediário</option>
                                    <option value="AVANCADO">Avançado</option>
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                    <ArrowLeft size={16} className="-rotate-90" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
                        <Sparkles size={20} className="text-primary-light mt-1 shrink-0" />
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            <span className="text-white font-bold">Dica da IA:</span> Definir o objetivo corretamente permite que o SmartWorkout selecione os exercícios, volumes e descansos ideais para o perfil da aluna.
                        </p>
                    </div>
                </div>

                {/* Submit Actions */}
                <div className="flex flex-col md:flex-row items-center justify-end gap-6 pt-4">
                    <Link href={`/personal/students/${id}`} className="font-bold text-muted-foreground hover:text-white transition-colors px-6">
                        Cancelar
                    </Link>
                    <GradientButton 
                        type="submit" 
                        size="lg" 
                        disabled={loading}
                        className="w-full md:w-auto h-16 px-16 shadow-pink-lg text-lg"
                    >
                        {loading ? (
                            <Activity className="animate-spin mr-3" />
                        ) : (
                            <Save className="mr-3" />
                        )}
                        {loading ? 'Salvando...' : 'Salvar Metas'}
                    </GradientButton>
                </div>
            </form>
        </div>
    );
}
