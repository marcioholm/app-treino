'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Assessment {
    id: string;
    date: string;
    label: string;
    weight: number | null;
    height: number | null;
    bmi: number | null;
    fatPercent: number | null;
    muscleMassKg: number | null;
    photos: { id: string; type: string; url: string }[];
}

export default function PhysicalAssessmentsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: studentId } = use(params);
    const router = useRouter();
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'history' | 'evolution' | 'compare'>('history');

    useEffect(() => {
        fetch(`/api/students/${studentId}/physical-assessments`)
            .then(res => res.json())
            .then(data => setAssessments(data.assessments || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [studentId]);

    const handleDelete = async (assessmentId: string) => {
        if (!confirm('Tem certeza que deseja excluir esta avaliação?')) return;
        try {
            const res = await fetch(`/api/students/${studentId}/physical-assessments/${assessmentId}`, { method: 'DELETE' });
            if (res.ok) {
                setAssessments(assessments.filter(a => a.id !== assessmentId));
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-400">Carregando...</div>;
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href={`/personal/students/${studentId}`} className="text-gray-400 hover:text-gray-400">
                    &larr; Voltar
                </Link>
                <h1 className="text-2xl font-bold text-white">Avaliações Físicas</h1>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex gap-1 bg-[#111111] p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-[#D4537E] text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Histórico
                    </button>
                    <button
                        onClick={() => setActiveTab('evolution')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'evolution' ? 'bg-[#D4537E] text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Evolução
                    </button>
                    <button
                        onClick={() => setActiveTab('compare')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'compare' ? 'bg-[#D4537E] text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Comparar
                    </button>
                </div>
                <Link
                    href={`/personal/students/${studentId}/physical-assessments/nova`}
                    className="bg-[#D4537E] hover:bg-[#993556] text-white px-4 py-2 rounded-lg font-medium"
                >
                    + Nova Avaliação
                </Link>
            </div>

            {activeTab === 'history' && (
                <>
                    {assessments.length === 0 ? (
                        <div className="bg-[#111111] border-2 border-dashed border-[#333333] rounded-xl p-12 text-center">
                            <p className="text-gray-400">Nenhuma avaliação física encontrada.</p>
                            <Link href={`/personal/students/${studentId}/physical-assessments/nova`} className="text-[#D4537E] text-sm hover:underline mt-2 inline-block">
                                + Criar primeira avaliação
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {assessments.map(assessment => (
                                <div key={assessment.id} className="bg-[#111111] border border-[#333333] rounded-xl p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{assessment.label}</h3>
                                            <p className="text-gray-400 text-sm">
                                                {new Date(assessment.date).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/personal/students/${studentId}/physical-assessments/${assessment.id}`}
                                                className="text-gray-400 hover:text-white text-sm"
                                            >
                                                Ver detalhes
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(assessment.id)}
                                                className="text-red-400 hover:text-red-300 text-sm"
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                        {assessment.weight && (
                                            <div>
                                                <p className="text-gray-500 text-xs">Peso</p>
                                                <p className="text-white font-medium">{assessment.weight} kg</p>
                                            </div>
                                        )}
                                        {assessment.bmi && (
                                            <div>
                                                <p className="text-gray-500 text-xs">IMC</p>
                                                <p className="text-white font-medium">{assessment.bmi}</p>
                                            </div>
                                        )}
                                        {assessment.fatPercent && (
                                            <div>
                                                <p className="text-gray-500 text-xs">% Gordura</p>
                                                <p className="text-white font-medium">{assessment.fatPercent}%</p>
                                            </div>
                                        )}
                                        {assessment.muscleMassKg && (
                                            <div>
                                                <p className="text-gray-500 text-xs">Massa Muscular</p>
                                                <p className="text-white font-medium">{assessment.muscleMassKg} kg</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {activeTab === 'evolution' && (
                <div className="bg-[#111111] border border-[#333333] rounded-xl p-6">
                    {assessments.length < 2 ? (
                        <p className="text-gray-400 text-center py-8">
                            Adicione pelo menos 2 avaliações para ver a evolução.
                        </p>
                    ) : (
                        <div className="space-y-8">
                            <h3 className="font-bold text-white">Evolução do Peso</h3>
                            <div className="h-64 flex items-end justify-around gap-2">
                                {assessments.slice().reverse().map((a, i) => (
                                    <div key={a.id} className="flex flex-col items-center">
                                        <div 
                                            className="w-12 bg-[#D4537E] rounded-t"
                                            style={{ height: `${(i + 1) * 30}px` }}
                                        />
                                        <p className="text-xs text-gray-400 mt-2">{a.weight}kg</p>
                                        <p className="text-xs text-gray-500">{new Date(a.date).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'compare' && (
                <div className="bg-[#111111] border border-[#333333] rounded-xl p-6">
                    {assessments.length < 2 ? (
                        <p className="text-gray-400 text-center py-8">
                            Adicione pelo menos 2 avaliações para comparar.
                        </p>
                    ) : (
                        <p className="text-gray-400 text-center py-8">
                            Em breve: comparador lado a lado.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}