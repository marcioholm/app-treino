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

    useEffect(() => {
        fetch(`/api/students/${id}`)
            .then(res => res.json())
            .then(data => setStudent(data.student))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

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

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/personal/students" className="text-gray-400 hover:text-gray-400">
                    &larr; Voltar
                </Link>
                <h1 className="text-2xl font-bold text-white">Detalhes da Aluna</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#111111] p-6 rounded-xl border border-[#333333] shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-[#D4537E]/20 text-[#D4537E] rounded-full flex items-center justify-center text-2xl font-bold">
                                {student.user.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="font-bold text-lg text-white">{student.user.name}</h2>
                                <p className="text-gray-400 text-sm">{student.user.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
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
                                    disabled={isGenerating}
                                    className="flex-1 sm:flex-none bg-[#D4537E] hover:bg-[#993556] disabled:bg-pink-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                                >
                                    {isGenerating ? 'Gerando...' : 'Gerar Treino Mágico ✨'}
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
