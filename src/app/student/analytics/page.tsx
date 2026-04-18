import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';

export default async function StudentAnalytics() {
    const cookieStore = await cookies();
    const token = cookieStore.get('trainer_os_token')?.value;
    const payload = token ? await verifyToken(token) : null;

    if (!payload || payload.role !== 'STUDENT') {
        redirect('/login');
    }

    const student = await prisma.student.findUnique({
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
    } as any);

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
                <h1 className="text-2xl font-bold text-gray-900">Meus Progressos</h1>
                <p className="text-gray-500 text-sm">Acompanhe sua evolução</p>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <span className="text-xs text-gray-500">Últimos 30 dias</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{recentWorkouts}</p>
                    <p className="text-xs text-gray-500">treinos realizados</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <span className="text-xs text-gray-500">Total</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{totalWorkouts}</p>
                    <p className="text-xs text-gray-500">treinos acumulados</p>
                </div>
            </div>

            {/* Weight Chart */}
            {assessments.length > 0 && (
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-900">Peso Corporal</h2>
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
                                        className="w-full bg-blue-600 rounded-t-md"
                                        style={{ height: `${Math.max(20, height)}%` }}
                                    />
                                    <p className="text-xs text-gray-500 mt-2">{a.weight}kg</p>
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
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-4">Check-ins Semanais</h2>
                {checkIns.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">Nenhum check-in realizado ainda.</p>
                ) : (
                    <div className="space-y-3">
                        {checkIns.slice(0, 4).map((checkIn: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {new Date(checkIn.createdAt).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                                <div className="flex gap-4 text-xs">
                                    <div className="text-center">
                                        <p className="text-gray-400">Energia</p>
                                        <p className="font-bold text-gray-900">{checkIn.energy}/10</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-gray-400">Sono</p>
                                        <p className="font-bold text-gray-900">{checkIn.sleep}/10</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-gray-400">Motivação</p>
                                        <p className="font-bold text-gray-900">{checkIn.motivation}/10</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Média de Energia</p>
                    <p className="text-xl font-bold text-gray-900">{avgEnergy} <span className="text-xs font-normal text-gray-500">/10</span></p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Média de Motivação</p>
                    <p className="text-xl font-bold text-gray-900">{avgMotivation} <span className="text-xs font-normal text-gray-500">/10</span></p>
                </div>
            </div>
        </div>
    );
}