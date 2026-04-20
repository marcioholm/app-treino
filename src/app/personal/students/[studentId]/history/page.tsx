'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';

interface Session {
    id: string;
    startedAt: string;
    completedAt: string | null;
    totalVolume: number | null;
    workout: { id: string; name: string };
    _count: { logs: number };
}

export default function StudentHistoryPage({ params }: { params: Promise<{ studentId: string }> }) {
    const { studentId } = use(params);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'history' | 'evolution'>('history');

    useEffect(() => {
        fetch(`/api/sessions?studentId=${studentId}&limit=20`)
            .then(res => res.json())
            .then(data => setSessions(data.sessions || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [studentId]);

    if (loading) {
        return <div className="p-8 text-center text-gray-400">Carregando...</div>;
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href={`/personal/students/${studentId}`} className="text-gray-400 hover:text-gray-400">
                    &larr; Voltar
                </Link>
                <h1 className="text-2xl font-bold text-white">Histórico de Treinos</h1>
            </div>

            <div className="flex gap-1 bg-[#111111] p-1 rounded-lg">
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'history' ? 'bg-[#D4537E] text-white' : 'text-gray-400'}`}
                >
                    Histórico
                </button>
                <button
                    onClick={() => setActiveTab('evolution')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'evolution' ? 'bg-[#D4537E] text-white' : 'text-gray-400'}`}
                >
                    Evolução
                </button>
            </div>

            {activeTab === 'history' && (
                <>
                    {sessions.length === 0 ? (
                        <div className="bg-[#111111] border-2 border-dashed border-[#333333] rounded-xl p-12 text-center">
                            <p className="text-gray-400">Nenhum treino realizado ainda.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sessions.map(session => (
                                <div key={session.id} className="bg-[#111111] border border-[#333333] rounded-xl p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-white">{session.workout.name}</h3>
                                            <p className="text-gray-400 text-sm">
                                                {new Date(session.startedAt).toLocaleDateString('pt-BR', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                        {session.completedAt && (
                                            <span className="bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded">
                                                Concluído
                                            </span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 mt-4">
                                        <div>
                                            <p className="text-gray-500 text-xs">Volume</p>
                                            <p className="text-white font-medium">
                                                {session.totalVolume?.toFixed(0) || 0} kg
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">Séries</p>
                                            <p className="text-white font-medium">{session._count.logs}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">Duração</p>
                                            <p className="text-white font-medium">-</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {activeTab === 'evolution' && (
                <div className="bg-[#111111] border border-[#333333] rounded-xl p-6">
                    <p className="text-gray-400 text-center py-8">
                        Em breve: gráfico de evolução de cargas por exercício.
                    </p>
                </div>
            )}
        </div>
    );
}