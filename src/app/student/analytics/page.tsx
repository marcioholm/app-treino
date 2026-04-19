import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';

export default async function StudentAnalytics() {
    const cookieStore = await cookies();
    const token = cookieStore.get('mk_app_token')?.value;
    const payload = token ? await verifyToken(token) : null;

    if (!payload || payload.role !== 'STUDENT') {
        redirect('/login');
    }

    const student: any = await prisma.student.findUnique({
        where: { userId: payload.userId },
        include: { 
            assessments: { orderBy: { date: 'desc' }, take: 10 },
            checkIns: { orderBy: { createdAt: 'desc' }, take: 8 },
            workouts: {
                include: {
                    sessions: {
                        include: {
                            logs: true
                        }
                    }
                }
            }
        }
    });

    if (!student) {
        redirect('/login');
    }

    const workouts = student.workouts?.flatMap((w: any) => w.sessions?.flatMap((s: any) => s.logs || [])) || [];
    const totalWorkouts = workouts.length;
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const recentWorkouts = workouts.filter((w: any) => new Date(w.createdAt) >= last30Days).length;

    const assessments = student.assessments || [];
    const latestAssessment = assessments[0];
    const previousAssessment = assessments[1];

    const weightChange = latestAssessment && previousAssessment 
        ? (latestAssessment.weight - previousAssessment.weight).toFixed(1) 
        : null;

    const checkIns = student.checkIns || [];
    const avgEnergy = checkIns.length > 0 
        ? (checkIns.reduce((acc: number, c: any) => acc + c.energy, 0) / checkIns.length).toFixed(1) 
        : '-';
    const avgMotivation = checkIns.length > 0 
        ? (checkIns.reduce((acc: number, c: any) => acc + c.motivation, 0) / checkIns.length).toFixed(1) 
        : '-';

    return (
        <div className="p-4 space-y-6 max-w-md mx-auto">
            <header className="pt-2 pb-2">
                <h1 className="text-2xl font-bold text-white">Meus Progressos</h1>
                <p className="text-gray-400 text-sm">Acompanhe sua evolução</p>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#111111] p-4 rounded-xl border border-[#333333] shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <span className="text-xs text-gray-400">Últimos 30 dias</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{recentWorkouts}</p>
                    <p className="text-xs text-gray-400">treinos realizados</p>
                </div>

                <div className="bg-[#111111] p-4 rounded-xl border border-[#333333] shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-[#D4537E]/20 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-[#D4537E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <span className="text-xs text-gray-400">Total</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{totalWorkouts}</p>
                    <p className="text-xs text-gray-400">treinos acumulados</p>
                </div>
            </div>

            {/* Weight Chart */}
            {assessments.length > 0 && (
                <div className="bg-[#111111] p-4 rounded-xl border border-[#333333] shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-white">Peso Corporal</h2>
                        {weightChange && (
                            <span className={`text-sm font-bold px-2 py-1 rounded ${parseFloat(weightChange) < 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {parseFloat(weightChange) < 0 ? '↓' : '↑'} {Math.abs(parseFloat(weightChange))}kg
                            </span>
                        )}
                    </div>
                    <div className="h-32 flex items-end justify-around gap-2">
                        {assessments.slice(0, 6).reverse().map((a: any, i: number) => {
                            const weights = assessments.map((a: any) => a.weight);
                            const minWeight = Math.min(...weights);
                            const maxWeight = Math.max(...weights);
                            const range = maxWeight - minWeight || 1;
                            const height = ((a.weight - minWeight) / range) * 100;
                            return (
                                <div key={i} className="flex flex-col items-center flex-1">
                                    <div 
                                        className="w-full bg-[#D4537E] rounded-t-md"
                                        style={{ height: `${Math.max(20, height)}%` }}
                                    />
                                    <p className="text-xs text-gray-400 mt-2">{a.weight}kg</p>
                                    <p className="text-[10px] text-gray-400">
                                        {new Date(a.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Weekly Check-ins */}
            <div className="bg-[#111111] p-4 rounded-xl border border-[#333333] shadow-sm">
                <h2 className="font-semibold text-white mb-4">Check-ins Semanais</h2>
                {checkIns.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">Nenhum check-in realizado ainda.</p>
                ) : (
                    <div className="space-y-3">
                        {checkIns.slice(0, 4).map((checkIn: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-black rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-white">
                                        {new Date(checkIn.createdAt).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                                <div className="flex gap-4 text-xs">
                                    <div className="text-center">
                                        <p className="text-gray-400">Energia</p>
                                        <p className="font-bold text-white">{checkIn.energy}/10</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-gray-400">Sono</p>
                                        <p className="font-bold text-white">{checkIn.sleep}/10</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-gray-400">Motivação</p>
                                        <p className="font-bold text-white">{checkIn.motivation}/10</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#111111] p-4 rounded-xl border border-[#333333] shadow-sm">
                    <p className="text-xs text-gray-400 mb-1">Média de Energia</p>
                    <p className="text-xl font-bold text-white">{avgEnergy} <span className="text-xs font-normal text-gray-400">/10</span></p>
                </div>
                <div className="bg-[#111111] p-4 rounded-xl border border-[#333333] shadow-sm">
                    <p className="text-xs text-gray-400 mb-1">Média de Motivação</p>
                    <p className="text-xl font-bold text-white">{avgMotivation} <span className="text-xs font-normal text-gray-400">/10</span></p>
                </div>
            </div>
        </div>
    );
}