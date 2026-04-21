import Link from 'next/link';
import { use } from 'react';

export default function WorkoutEditor({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <div className="min-h-screen bg-background pb-24">
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-white/5 mb-10">
                <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href={`/personal/students/${id}`} className="size-10 rounded-xl bg-white/5 grid place-items-center text-muted-foreground hover:text-white transition-all group">
                            <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                        <div>
                            <h1 className="font-display text-2xl font-black text-white tracking-tight">Editor de Treino</h1>
                            <p className="text-[10px] font-bold text-primary-light uppercase tracking-widest mt-0.5">Automático via IA</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <GradientButton variant="outline" size="sm">
                            Salvar Rascunho
                        </GradientButton>
                        <GradientButton size="sm">
                            Publicar Treino
                        </GradientButton>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 md:px-6 max-w-5xl space-y-10">
            {["A - Empurrar (Peito, Ombros, Tríceps)", "B - Puxar (Costas, Bíceps)"].map((sessionName, i) => (
                <div key={i} className="bg-glass rounded-[2rem] overflow-hidden border-white/5 transition-all hover:bg-white/[0.04]">
                    <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-xl bg-primary/10 grid place-items-center text-primary-light font-display font-black">
                                {sessionName.split(' ')[0]}
                            </div>
                            <h2 className="font-display text-xl font-bold text-white">{sessionName.split(' - ')[1]}</h2>
                        </div>
                        <button className="text-xs font-bold text-primary-light hover:text-white transition-colors uppercase tracking-widest">+ Adicionar Exercício</button>
                    </div>

                    <div className="divide-y divide-white/5 px-4">
                        {[
                            { name: "Supino Reto Barra", desc: "Peito • Barra Livre", sets: 4, reps: "8-12", rest: 90 },
                            { name: "Desenvolvimento Halteres", desc: "Ombros • Halteres", sets: 3, reps: "10-12", rest: 60 }
                        ].map((exercise, idx) => (
                            <div key={idx} className="py-6 px-4 flex gap-6 items-center group hover:bg-white/[0.02] rounded-2xl transition-all">
                                <div className="text-white/10 group-hover:text-primary-light/40 transition-colors cursor-move">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                                </div>
                                
                                <div className="flex-1 grid grid-cols-12 gap-8 items-center text-left">
                                    <div className="col-span-5">
                                        <p className="font-display font-bold text-lg text-white group-hover:text-primary-light transition-colors">{exercise.name}</p>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">{exercise.desc}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="label-caps block mb-2 opacity-50">Séries</label>
                                        <input type="number" defaultValue={exercise.sets} className="w-full h-11 bg-black/40 border border-white/5 rounded-xl text-center text-white font-display font-bold focus:border-primary-light outline-none" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="label-caps block mb-2 opacity-50">Repetições</label>
                                        <input type="text" defaultValue={exercise.reps} className="w-full h-11 bg-black/40 border border-white/5 rounded-xl text-center text-white font-display font-bold focus:border-primary-light outline-none" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="label-caps block mb-2 opacity-50">Descanso</label>
                                        <div className="relative">
                                            <input type="number" defaultValue={exercise.rest} className="w-full h-11 bg-black/40 border border-white/5 rounded-xl text-center text-white font-display font-bold focus:border-primary-light outline-none pr-6" />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 text-[10px] font-bold">s</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <button className="size-10 rounded-xl bg-destructive/5 text-destructive/40 hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100 grid place-items-center">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            </div>
        </div>       </div>
    );
}
