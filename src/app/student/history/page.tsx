'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { History, Calendar, UserRound, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WorkoutHistoryLog {
    id: string;
    workoutName: string;
    sessionName: string;
    date: string;
    durationMinutes: number;
    volume: number;
    rpe: number | null;
}

export default function HistoryPage() {
    const [logs, setLogs] = useState<WorkoutHistoryLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/student/history')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setLogs(data);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="flex flex-col h-screen bg-black pb-20">
            <header className="bg-[#111111] px-6 py-5 border-b border-[#333333] flex justify-between items-center shadow-sm sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-white tracking-tight">Histórico</h1>
            </header>

            <main className="flex-1 p-4 lg:p-6 overflow-auto max-w-md mx-auto w-full">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-[#111111] rounded-2xl p-5 border border-[#333333] animate-pulse">
                                <div className="h-5 bg-white/5 rounded w-1/2 mb-3"></div>
                                <div className="h-4 bg-white/5 rounded w-1/3 mb-4"></div>
                                <div className="h-4 bg-white/5 rounded w-1/4"></div>
                            </div>
                        ))}
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="size-20 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                            <ClipboardList size={40} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Nenhum treino concluído</h3>
                            <p className="text-sm text-gray-400 max-w-[200px] mx-auto mt-1">Seu histórico aparecerá aqui conforme você completar seus treinos.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {logs.map((log) => (
                            <div key={log.id} className="bg-[#111111] rounded-2xl p-5 border border-[#333333] shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-white">
                                        {log.workoutName} - {log.sessionName}
                                    </h3>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-success bg-success/10 border border-success/20 px-2 py-1 rounded-md">
                                        Concluído
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm mb-3">
                                    {format(new Date(log.date), "EEEE • mm 'min'", { locale: ptBR })}
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                        {log.volume.toLocaleString('pt-BR')} kg volume total
                                    </div>
                                    {log.rpe && (
                                        <div className="text-[10px] text-primary-light font-black uppercase tracking-widest">
                                            RPE {log.rpe}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 w-full bg-[#111111] border-t border-[#333333] px-6 py-3 flex justify-between items-center pb-safe-bottom z-50 md:hidden">
                <Link href="/student/today" className="flex flex-col items-center gap-1 text-gray-400">
                    <Calendar className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Hoje</span>
                </Link>
                <Link href="/student/history" className="flex flex-col items-center gap-1 text-[#D4537E]">
                    <History className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Histórico</span>
                </Link>
                <Link href="/student/profile" className="flex flex-col items-center gap-1 text-gray-400">
                    <UserRound className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Perfil</span>
                </Link>
            </nav>
        </div>
    );
}
