'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import GradientButton from '@/components/trainer/GradientButton';
import StudentCard from '@/components/trainer/StudentCard';

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

    const studentsWithCards = filteredStudents.map(s => ({
        id: s.id,
        name: s.user.name,
        objetivo: 'Avaliação',
        imc: 0,
        gordura: { atual: 0, variacao: 0 },
        ultimaAvaliacao: s.user.birthDate 
            ? new Date(s.user.birthDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
            : 'N/A',
        peso: { atual: 0, variacao: 0 }
    }));

    return (
        <div className="min-h-screen bg-surface-alt pb-16">
            <section className="container mx-auto px-4 md:px-6 py-8">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <div>
                        <h1 className="font-display text-2xl md:text-3xl font-bold">Suas alunas</h1>
                        <p className="text-sm text-muted-foreground">{students.length} alunas ativas</p>
                    </div>
                    <GradientButton onClick={() => setIsModalOpen(true)}>
                        <Plus size={16} /> Nova aluna
                    </GradientButton>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Buscar aluna..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-96 px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    />
                </div>

                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Carregando alunas...</div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {studentsWithCards.map(student => (
                            <StudentCard key={student.id} aluna={student} />
                        ))}
                    </div>
                )}

                {!loading && studentsWithCards.length === 0 && (
                    <div className="rounded-2xl bg-card border border-border p-12 text-center">
                        <p className="text-muted-foreground">Nenhuma aluna encontrada.</p>
                    </div>
                )}
            </section>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-pink-lg">
                        <div className="p-5 border-b border-border flex justify-between items-center">
                            <h2 className="font-display text-lg font-bold">Cadastrar Nova Aluna</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
                        </div>
                        <form onSubmit={handleCreate} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Nome Completo</label>
                                <input 
                                    required 
                                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-foreground" 
                                    value={form.name} 
                                    onChange={e => setForm({...form, name: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">E-mail</label>
                                <input 
                                    type="email" 
                                    required 
                                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-foreground" 
                                    value={form.email} 
                                    onChange={e => setForm({...form, email: e.target.value})} 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Senha Inicial</label>
                                    <input 
                                        type="password" 
                                        required 
                                        className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-foreground" 
                                        value={form.password} 
                                        onChange={e => setForm({...form, password: e.target.value})} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Data Nascimento</label>
                                    <input 
                                        type="date" 
                                        className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-foreground" 
                                        value={form.birthDate} 
                                        onChange={e => setForm({...form, birthDate: e.target.value})} 
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-2">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)} 
                                    className="px-4 py-2.5 text-muted-foreground font-medium hover:text-foreground"
                                >
                                    Cancelar
                                </button>
                                <GradientButton type="submit">Salvar Aluna</GradientButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}