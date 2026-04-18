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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <Link href="/personal/students/new" className="bg-[#D4537E] hover:bg-[#993556] text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
                    + Nova Aluna
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
                    <h2 className="text-gray-500 font-medium text-sm">Total de Alunos</h2>
                    <p className="text-3xl font-bold text-gray-900">{students.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
                    <h2 className="text-gray-500 font-medium text-sm">Treinos Ativos (30d)</h2>
                    <p className="text-3xl font-bold text-gray-900">{activeWorkouts}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
                    <h2 className="text-gray-500 font-medium text-sm">Avaliações Pendentes</h2>
                    <p className="text-3xl font-bold text-yellow-600">{pendingAssessments}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                {/* Alunos List */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden lg:col-span-2">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="font-semibold text-gray-900">Aderência dos Alunos (Últimos 30 dias)</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {studentsWithAdherence.length === 0 ? (
                            <div className="px-6 py-8 text-center text-gray-500">Nenhum aluno cadastrado ainda.</div>
                        ) : (
                            studentsWithAdherence.map((student) => (
                                <div key={student.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-[#D4537E] font-bold">
                                            {student.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{student.user.name}</p>
                                            <p className="text-sm text-gray-500">{student.user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 ${getAdherenceColor(student.adherence)}`}>
                                            Aderência: {student.adherence}%
                                        </div>
                                        <Link href={`/personal/students/${student.id}`} className="text-blue-600 text-sm font-medium hover:underline">
                                            Ver Detalhes
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
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
                        {notifications.length > 0 && <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 rounded-full">{notifications.length}</span>}
                    </div>
                    <div className="divide-y divide-gray-100 max-h-[500px] overflow-auto">
                        {notifications.length === 0 ? (
                            <div className="px-6 py-8 text-center text-gray-500 text-sm">Tudo tranquilo por aqui.</div>
                        ) : (
                            notifications.map((notif: any) => (
                                <div key={notif.id} className="px-5 py-4 hover:bg-red-50 transition-colors">
                                    <h3 className="text-sm font-bold text-gray-900 mb-1">{notif.title}</h3>
                                    <p className="text-sm text-gray-600">{notif.message}</p>
                                    <div className="mt-3 flex justify-end gap-3">
                                        <button className="text-xs text-gray-500 hover:text-gray-800 font-medium">Ignorar</button>
                                        {notif.linkUrl && (
                                            <Link href={notif.linkUrl} className="text-xs text-blue-600 hover:text-blue-800 font-bold">
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
