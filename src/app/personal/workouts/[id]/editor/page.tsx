'use client';
import { use } from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Send, Trash2, GripVertical, Plus } from 'lucide-react';
import GradientButton from '@/components/trainer/GradientButton';

interface Exercise {
    id: string;
    exercise: {
        name: string;
        group: string;
        equipment: string | null;
    };
    sets: number;
    reps: string;
    restTime: number | null;
}

interface Session {
    id: string;
    name: string;
    order: number;
    exercises: Exercise[];
}

interface Workout {
    id: string;
    name: string;
    notes: string | null;
    sessions: Session[];
}

export default function WorkoutEditor({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch(`/api/workouts/${id}`)
            .then(res => res.json())
            .then(data => {
                setWorkout(data.workout);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    const handlePublish = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/workouts/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ published: true })
            });
            if (res.ok) {
                router.push(`/personal/students`);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <p className="text-muted-foreground font-black animate-pulse">CARREGANDO PROTOCOLO...</p>
        </div>
    );

    if (!workout) return <div className="p-20 text-center">Treino não encontrado</div>;

    return (
        <div className="min-h-screen bg-background pb-24">
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-white/5 mb-10">
                <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={() => router.back()} className="size-10 rounded-xl bg-white/5 grid place-items-center text-muted-foreground hover:text-white transition-all group">
                            <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <div>
                            <h1 className="font-display text-2xl font-black text-white tracking-tight">{workout.name}</h1>
                            <p className="text-[10px] font-bold text-primary-light uppercase tracking-widest mt-0.5">Editor Engine M&K Fitness</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <GradientButton variant="outline" size="sm" onClick={() => router.back()}>
                            Voltar
                        </GradientButton>
                        <GradientButton size="sm" onClick={handlePublish} disabled={saving}>
                            {saving ? 'Publicando...' : 'Publicar Treino'}
                        </GradientButton>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 md:px-6 max-w-5xl space-y-10">
                {workout.sessions.map((session, i) => (
                    <div key={session.id} className="bg-glass rounded-[2rem] overflow-hidden border-white/5 transition-all hover:bg-white/[0.04]">
                        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-primary/10 grid place-items-center text-primary-light font-display font-black">
                                    {String.fromCharCode(65 + i)}
                                </div>
                                <h2 className="font-display text-xl font-bold text-white">{session.name}</h2>
                            </div>
                            <button className="text-[10px] font-black text-primary-light hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2">
                                <Plus size={14} /> Adicionar Exercício
                            </button>
                        </div>

                        <div className="divide-y divide-white/5 px-4">
                            {session.exercises.map((ex, idx) => (
                                <div key={ex.id} className="py-6 px-4 flex gap-6 items-center group hover:bg-white/[0.02] rounded-2xl transition-all">
                                    <div className="text-white/10 group-hover:text-primary-light/40 transition-colors cursor-move">
                                        <GripVertical size={20} />
                                    </div>
                                    
                                    <div className="flex-1 grid grid-cols-12 gap-8 items-center text-left">
                                        <div className="col-span-5">
                                            <p className="font-display font-bold text-lg text-white group-hover:text-primary-light transition-colors">{ex.exercise.name}</p>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                                                {ex.exercise.group} • {ex.exercise.equipment || 'Livre'}
                                            </p>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="label-caps block mb-2 opacity-50 text-[9px]">Séries</label>
                                            <input type="number" defaultValue={ex.sets} className="w-full h-11 bg-black/40 border border-white/5 rounded-xl text-center text-white font-display font-bold focus:border-primary-light outline-none" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="label-caps block mb-2 opacity-50 text-[9px]">Reps</label>
                                            <input type="text" defaultValue={ex.reps} className="w-full h-11 bg-black/40 border border-white/5 rounded-xl text-center text-white font-display font-bold focus:border-primary-light outline-none" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="label-caps block mb-2 opacity-50 text-[9px]">Pausa</label>
                                            <div className="relative">
                                                <input type="number" defaultValue={ex.restTime || 60} className="w-full h-11 bg-black/40 border border-white/5 rounded-xl text-center text-white font-display font-bold focus:border-primary-light outline-none pr-6" />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 text-[10px] font-bold">s</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button className="size-10 rounded-xl bg-destructive/5 text-destructive/40 hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100 grid place-items-center">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
