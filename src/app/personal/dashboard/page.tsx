import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';
import { generateTrainerAlerts } from '@/lib/engine/alerts';

export default async function PersonalDashboard() {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('mk_app_token')?.value;
    const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

    if (!payload || (payload.role !== 'TRAINER' && payload.role !== 'OWNER_PERSONAL')) {
        return <div className="p-6 text-red-500">Acesso negado.</div>;
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const students = await prisma.student.findMany({
        where: { tenantId: payload.tenantId },
        include: {
            user: true,
            goals: { orderBy: { createdAt: 'desc' }, take: 1 },
            workouts: {
                include: {
                    sessions: {
                        include: {
                            logs: {
                                where: { createdAt: { gte: thirtyDaysAgo } }
                            }
                        }
                    }
                }
            },
            assessments: { orderBy: { createdAt: 'desc' }, take: 1 }
        }
    });

    // Run Background Alert Engine
    await generateTrainerAlerts(payload.tenantId);

    const notifications = await (prisma as any).notification.findMany({
        where: { tenantId: payload.tenantId, resolved: false },
        orderBy: { createdAt: 'desc' }
    });

    let pendingAssessments = 0;

    const studentsWithAdherence = students.map(student => {
        if (student.assessments.length === 0 || student.goals.length === 0) {
            pendingAssessments++;
        }

        const goal = student.goals[0];
        let adherence = 0;

        if (goal && goal.daysPerWeek > 0) {
            const expectedWorkouts = Math.floor(goal.daysPerWeek * (30 / 7));
            const completedWorkouts = student.workouts.flatMap(w => w.sessions.flatMap(s => s.logs)).length;
            adherence = Math.min(100, Math.round((completedWorkouts / expectedWorkouts) * 100));
        }

        return {
            ...student,
            adherence
        };
    });

    const activeWorkouts = studentsWithAdherence.filter(s => s.adherence > 0).length;

    const getAdherenceColor = (score: number) => {
        if (score >= 85) return 'text-green-600 bg-green-50';
        if (score >= 50) return 'text-pink-600 bg-pink-50';
        return 'text-red-600 bg-red-50';
    };

    // Calculate Birthdays
    const today = new Date();
    const upcomingBirthdays = students.filter(s => {
        if (!s.user.birthDate) return false;
        const bdate = new Date(s.user.birthDate);
        bdate.setFullYear(today.getFullYear());
        // if birthday passed this year but was within last 7 days? Or next 7 days?
        // Let's check if birthday is today or in the next 7 days.
        if (bdate < today && today.getDate() !== bdate.getDate()) {
            bdate.setFullYear(today.getFullYear() + 1);
        }
        const diffDays = Math.ceil((bdate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
    }).sort((a, b) => {
        const dA = new Date(a.user.birthDate!); dA.setFullYear(today.getFullYear());
        const dB = new Date(b.user.birthDate!); dB.setFullYear(today.getFullYear());
        if (dA < today) dA.setFullYear(today.getFullYear() + 1);
        if (dB < today) dB.setFullYear(today.getFullYear() + 1);
        return dA.getTime() - dB.getTime();
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            </div>

            {/* Missão de Aniversário Banner */}
            {upcomingBirthdays.length > 0 && (
                <div className="bg-gradient-to-r from-[#D4537E] to-[#993556] rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
                    <div className="absolute -right-10 -top-10 opacity-20 text-9xl">🎂</div>
                    <div className="relative z-10 space-y-2 mb-4 md:mb-0">
                        <span className="bg-white/20 px-3 py-1 text-xs font-bold text-white rounded-full uppercase tracking-wider backdrop-blur-sm">Missão da Semana</span>
                        <h2 className="text-2xl font-bold text-white">É tempo de celebração!</h2>
                        <p className="text-pink-100 max-w-xl">Encontre as alunas e dê os parabéns! Isso fortalece muito a nossa comunidade.</p>
                    </div>
                    
                    <div className="relative z-10 flex flex-col gap-2 w-full md:w-auto">
                        {upcomingBirthdays.map(b => {
                            const bDate = new Date(b.user.birthDate!);
                            const isToday = bDate.getDate() === today.getDate() && bDate.getMonth() === today.getMonth();
                            return (
                                <Link href={`/personal/chat?studentId=${b.id}`} key={b.id} className="bg-black/30 hover:bg-black/50 transition-colors p-3 rounded-xl flex items-center gap-4 text-white border border-white/20">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                                        {b.user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold">{b.user.name.split(' ')[0]}</p>
                                        <p className="text-xs text-pink-200">{isToday ? "É hoje! 🎉" : `${bDate.getDate()}/${bDate.getMonth()+1}`}</p>
                                    </div>
                                    <div className="ml-4 bg-white text-[#D4537E] text-xs font-bold px-3 py-1 rounded-full">
                                        Mandar MSG
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/personal/code" className="bg-gradient-to-br from-[#D4537E] to-[#993556] p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex flex-col justify-between h-32">
                    <div>
                        <h2 className="text-pink-100 font-medium text-sm">Seu Código</h2>
                        <p className="text-2xl font-bold mt-1">Compartilhe</p>
                    </div>
                    <p className="text-xs text-pink-200">Clique para copiar</p>
                </Link>
                <div className="bg-[#111111] p-6 rounded-xl border border-[#333333] shadow-sm flex flex-col justify-between h-32">
                    <h2 className="text-gray-400 font-medium text-sm">Total de Alunas</h2>
                    <p className="text-3xl font-bold text-white">{students.length}</p>
                </div>
                <div className="bg-[#111111] p-6 rounded-xl border border-[#333333] shadow-sm flex flex-col justify-between h-32">
                    <h2 className="text-gray-400 font-medium text-sm">Treinos Ativos (30d)</h2>
                    <p className="text-3xl font-bold text-white">{activeWorkouts}</p>
                </div>
                <div className="bg-[#111111] p-6 rounded-xl border border-[#333333] shadow-sm flex flex-col justify-between h-32">
                    <h2 className="text-gray-400 font-medium text-sm">Avaliações Pendentes</h2>
                    <p className="text-3xl font-bold text-yellow-600">{pendingAssessments}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                {/* Alunos List */}
                <div className="bg-[#111111] rounded-xl border border-[#333333] shadow-sm overflow-hidden lg:col-span-2">
                    <div className="px-6 py-4 border-b border-[#333333] flex justify-between items-center">
                        <h2 className="font-semibold text-white">Aderência dos Alunos (Últimos 30 dias)</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {studentsWithAdherence.length === 0 ? (
                            <div className="px-6 py-8 text-center text-gray-400">Nenhum aluno cadastrado ainda.</div>
                        ) : (
                            studentsWithAdherence.map((student) => (
                                <div key={student.id} className="px-6 py-4 flex items-center justify-between hover:bg-black transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-[#D4537E] font-bold">
                                            {student.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{student.user.name}</p>
                                            <p className="text-sm text-gray-400">{student.user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 ${getAdherenceColor(student.adherence)}`}>
                                            Aderência: {student.adherence}%
                                        </div>
                                        <Link href={`/personal/students/${student.id}`} className="text-[#D4537E] text-sm font-medium hover:underline">
                                            Ver Detalhes
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-[#111111] rounded-xl border border-[#333333] shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#333333] flex justify-between items-center bg-black">
                        <h2 className="font-semibold text-white flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                {notifications.length > 0 && (
                                    <>
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </>
                                )}
                            </span>
                            Notificações
                        </h2>
                        {notifications.length > 0 && <span className="text-xs font-bold text-gray-400 bg-[#333333] px-2 rounded-full">{notifications.length}</span>}
                    </div>
                    <div className="divide-y divide-gray-100 max-h-[500px] overflow-auto">
                        {notifications.length === 0 ? (
                            <div className="px-6 py-8 text-center text-gray-400 text-sm">Tudo tranquilo por aqui.</div>
                        ) : (
                            notifications.map((notif: any) => (
                                <div key={notif.id} className="px-5 py-4 hover:bg-red-50 transition-colors">
                                    <h3 className="text-sm font-bold text-white mb-1">{notif.title}</h3>
                                    <p className="text-sm text-gray-400">{notif.message}</p>
                                    <div className="mt-3 flex justify-end gap-3">
                                        <button className="text-xs text-gray-400 hover:text-gray-100 font-medium">Ignorar</button>
                                        {notif.linkUrl && (
                                            <Link href={notif.linkUrl} className="text-xs text-[#D4537E] hover:text-blue-800 font-bold">
                                                Visualizar
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
