'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import GradientButton from '@/components/trainer/GradientButton';
import StudentCard from '@/components/trainer/StudentCard';
import EmptyState from '@/components/ui/EmptyState';
import { Users, Plus } from 'lucide-react';

export default function StudentsList() {
    const [students, setStudents] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [form, setForm] = useState({ name: '', email: '', password: '', birthDate: '' });

    const fetchStudents = async () => {
        try {
            const res = await fetch('/api/students');
            const data = await res.json();
            if (data.students) setStudents(data.students);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStudents(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                setIsModalOpen(false);
                setForm({ name: '', email: '', password: '', birthDate: '' });
                fetchStudents();
            } else {
                const data = await res.json();
                alert(data.error || 'Erro ao criar aluno');
            }
        } catch (e) {
            alert('Erro ao criar aluno');
        }
    };

    const filteredStudents = students.filter(s => 
        s.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const studentsWithCards = filteredStudents.map(s => {
        const latestAssessment = s.physicalAssessments?.[0] || s.assessments?.[0];
        const prevAssessment = s.physicalAssessments?.[1] || s.assessments?.[1];
        
        const currentWeight = latestAssessment?.weight || 0;
        const prevWeight = prevAssessment?.weight || currentWeight;
        const weightVar = currentWeight - prevWeight;

        const currentFat = latestAssessment?.fatPercent || 0;
        const prevFat = prevAssessment?.fatPercent || currentFat;
        const fatVar = currentFat - prevFat;

        return {
            id: s.id,
            name: s.user.name,
            objetivo: s.goals?.[0]?.objective || 'Avaliação',
            imc: latestAssessment?.bmi || 0,
            gordura: { atual: currentFat, variacao: fatVar },
            ultimaAvaliacao: latestAssessment?.date 
                ? new Date(latestAssessment.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                : 'N/A',
            peso: { atual: currentWeight, variacao: weightVar }
        };
    });

    return (
        <div className="min-h-screen bg-background pb-24">
            <section className="relative overflow-hidden pt-12 pb-20">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
                
                <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
                    <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
                        Suas <span className="text-gradient-brand">Alunas</span> 
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium max-w-lg mx-auto mb-10">
                        Gerencie o progresso e mantenha suas atletas motivadas com dados precisos.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <GradientButton size="lg" onClick={() => setIsModalOpen(true)}>
                            <Plus size={20} /> Cadastrar Nova
                        </GradientButton>
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4 md:px-6">
                {/* Search Header */}
                <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-md group">
                        <input
                            type="text"
                            placeholder="Buscar pelo nome ou e-mail..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 bg-glass border-white/5 rounded-2xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary-light/50 transition-all placeholder:text-muted-foreground/50"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary-light transition-colors">
                            <Users size={20} />
                        </span>
                    </div>
                    <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Mostrando <span className="text-white">{filteredStudents.length}</span> alunas
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 rounded-[2.5rem] bg-white/5 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-up">
                        {studentsWithCards.map(student => (
                            <StudentCard key={student.id} aluna={student} />
                        ))}
                        
                        {studentsWithCards.length === 0 && (
                            <div className="col-span-full py-20 relative z-10">
                                <EmptyState 
                                    icon={Users}
                                    title="Nenhuma aluna encontrada"
                                    description={searchQuery ? "Tente buscar por um termo diferente." : "Sua academia ainda está vazia. Que tal cadastrar sua primeira aluna?"}
                                />
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-glass-dark border border-white/5 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-pink-lg animate-fade-up">
                        <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <div>
                                <h2 className="font-display text-2xl font-black text-white tracking-tight">Nova Aluna</h2>
                                <p className="text-xs font-bold text-primary-light uppercase tracking-widest mt-1">Cadastro Inicial</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="size-10 rounded-xl bg-white/5 grid place-items-center text-muted-foreground hover:text-white hover:bg-white/10 transition-all">✕</button>
                        </div>
                        <form onSubmit={handleCreate} className="p-10 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="label-caps px-4">Nome Completo</label>
                                    <input 
                                        required 
                                        className="w-full px-6 py-4 bg-black/20 border border-white/5 rounded-2xl text-white font-medium focus:border-primary-light outline-none" 
                                        value={form.name} 
                                        onChange={e => setForm({...form, name: e.target.value})} 
                                        placeholder="Ex: Maria Oliveira"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="label-caps px-4">E-mail Profissional</label>
                                    <input 
                                        type="email" 
                                        required 
                                        className="w-full px-6 py-4 bg-black/20 border border-white/5 rounded-2xl text-white font-medium focus:border-primary-light outline-none" 
                                        value={form.email} 
                                        onChange={e => setForm({...form, email: e.target.value})} 
                                        placeholder="aluna@exemplo.com"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="label-caps px-4">Senha Inicial</label>
                                        <input 
                                            type="password" 
                                            required 
                                            className="w-full px-6 py-4 bg-black/20 border border-white/5 rounded-2xl text-white font-medium focus:border-primary-light outline-none" 
                                            value={form.password} 
                                            onChange={e => setForm({...form, password: e.target.value})} 
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="label-caps px-4">Nascimento</label>
                                        <input 
                                            type="date" 
                                            className="w-full px-6 py-4 bg-black/20 border border-white/5 rounded-2xl text-white font-medium focus:border-primary-light outline-none" 
                                            value={form.birthDate} 
                                            onChange={e => setForm({...form, birthDate: e.target.value})} 
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="pt-6 flex justify-end gap-4">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)} 
                                    className="px-6 py-4 text-muted-foreground font-bold hover:text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                <GradientButton type="submit" size="lg">Cadastrar Aluna</GradientButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}