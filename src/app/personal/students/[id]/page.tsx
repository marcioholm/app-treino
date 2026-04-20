'use client';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Student {
    id: string;
    phone: string | null;
    user: { name: string; email: string };
    assessments: { weight: number; height: number; bmi: number; createdAt: string }[];
    goals: { objective: string; level: string; daysPerWeek: number }[];
    weeklyCheckIns: { weight: number; energy: number; sleep: number; soreness: number; motivation: number; notes: string | null; createdAt: string }[];
}

export default function StudentDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
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
        return <div className="p-8 text-center text-gray-500">Carregando...</div>;
    }

    if (!student) {
        return <div className="p-8 text-center text-gray-500">Aluna não encontrada</div>;
    }

    const hasAssessment = student.assessments?.length > 0;
    const hasGoal = student.goals?.length > 0;
    const canGenerateMagic = hasAssessment && hasGoal;

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/personal/students" className="text-gray-400 hover:text-gray-400">
                    &larr; Voltar
                </Link>
                <h1 className="text-2xl font-bold text-white">Detalhes da Aluna</h1>
            </div>

            {!canGenerateMagic && (
                <div className="bg-amber-950/30 border border-amber-600/50 p-4 rounded-xl">
                    <p className="text-amber-200 text-sm font-medium mb-2">⚠️ Dados incompletos</p>
                    <p className="text-amber-100/70 text-xs mb-3">
                        Para gerar treinos automaticamente, você precisa adicionar:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {!hasAssessment && (
                            <Link
                                href={`/personal/students/${id}/assessment`}
                                className="text-xs bg-amber-600/20 text-amber-300 px-2 py-1 rounded hover:bg-amber-600/30"
                            >
                                + Avaliação Física
                            </Link>
                        )}
                        {!hasGoal && (
                            <Link
                                href={`/personal/students/${id}/assessment`}
                                className="text-xs bg-amber-600/20 text-amber-300 px-2 py-1 rounded hover:bg-amber-600/30"
                            >
                                + Objetivo & Nível
                            </Link>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#111111] p-6 rounded-xl border border-[#333333] shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-400">Dados Pessoais</h3>
                            <button 
                                onClick={() => setEditingProfile(!editingProfile)}
                                className="text-[#D4537E] text-sm hover:underline"
                            >
                                {editingProfile ? 'Cancelar' : 'Editar'}
                            </button>
                        </div>
                        
                        {editingProfile ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Nome</label>
                                    <input
                                        type="text"
                                        value={profileForm.name}
                                        onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                                        className="w-full border border-[#444444] rounded-lg p-2 bg-black text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={profileForm.email}
                                        onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                                        className="w-full border border-[#444444] rounded-lg p-2 bg-black text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Telefone</label>
                                    <input
                                        type="text"
                                        value={profileForm.phone}
                                        onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                                        className="w-full border border-[#444444] rounded-lg p-2 bg-black text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Data de Nascimento</label>
                                    <input
                                        type="date"
                                        value={profileForm.birthDate}
                                        onChange={(e) => setProfileForm({...profileForm, birthDate: e.target.value})}
                                        className="w-full border border-[#444444] rounded-lg p-2 bg-black text-white text-sm"
                                    />
                                </div>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={savingProfile}
                                    className="w-full bg-[#D4537E] hover:bg-[#993556] disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium"
                                >
                                    {savingProfile ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-[#D4537E]/20 text-[#D4537E] rounded-full flex items-center justify-center text-2xl font-bold">
                                    {student.user.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg text-white">{student.user.name}</h2>
                                    <p className="text-gray-400 text-sm">{student.user.email}</p>
                                    {student.phone && <p className="text-gray-500 text-sm">{student.phone}</p>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#111111] p-6 rounded-xl border border-[#333333] shadow-sm">
                        <Link
                            href={`/personal/students/${id}/physical-assessments`}
                            className="block w-full text-center border border-[#333333] hover:bg-black text-gray-300 py-3 rounded-lg font-medium transition-colors mb-4"
                        >
                            Avaliações Físicas
                        </Link>
                    </div>

                    <div className="bg-[#111111] p-6 rounded-xl border border-[#333333] shadow-sm">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                            <h2 className="text-lg font-bold text-white">Treinos</h2>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => router.push(`/personal/workouts/new/editor?studentId=${id}`)}
                                    className="flex-1 sm:flex-none bg-[#111111] border border-[#333333] hover:bg-black text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                                >
                                    Gerar Manual
                                </button>
                                <button
                                    onClick={handleMagicGenerate}
                                    disabled={isGenerating || !canGenerateMagic}
                                    className="flex-1 sm:flex-none bg-[#D4537E] hover:bg-[#993556] disabled:bg-pink-400/50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                                >
                                    {isGenerating ? 'Gerando...' : canGenerateMagic ? 'Gerar Treino Mágico ✨' : 'Precisa Avaliação'}
                                </button>
                            </div>
                        </div>
                        <div className="mt-4 p-8 text-center border-2 border-dashed border-[#333333] rounded-lg">
                            <p className="text-gray-400 text-sm">Nenhum treino publicado no momento.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
