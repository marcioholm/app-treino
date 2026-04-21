import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';
import { generateTrainerAlerts } from '@/lib/engine/alerts';
import { Activity, Dumbbell, ClipboardCheck, Users, Plus } from 'lucide-react';
import GradientButton from '@/components/trainer/GradientButton';
import MetricCard from '@/components/trainer/MetricCard';
import StudentCard from '@/components/trainer/StudentCard';
import WorkoutTimeline from '@/components/trainer/WorkoutTimeline';

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
            assessments: { orderBy: { createdAt: 'desc' }, take: 1 },
            physicalAssessments: { orderBy: { date: 'desc' }, take: 1 }
        }
    });

    await generateTrainerAlerts(payload.tenantId);

    const notifications = await (prisma as any).notification.findMany({
        where: { tenantId: payload.tenantId, resolved: false },
        orderBy: { createdAt: 'desc' }
    });

    const trainer = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { name: true }
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

        const latestAssessment = student.physicalAssessments[0];
        const weight = latestAssessment?.weight || 0;
        
        return {
            id: student.id,
            name: student.user.name,
            objetivo: goal?.objective || 'Não definido',
            nivel: goal?.level || 'Iniciante',
            imc: latestAssessment?.bmi || 0,
            gordura: { 
                atual: latestAssessment?.fatPercent || 0, 
                variacao: 0 
            },
            peso: {
                atual: weight,
                variacao: 0
            },
            ultimaAvaliacao: latestAssessment 
                ? new Date(latestAssessment.date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
                : 'N/A',
            adherence,
            assessments: student.assessments,
            goals: student.goals
        };
    });

    const activeWorkouts = studentsWithAdherence.filter(s => s.adherence > 0).length;

    const today = new Date();
    const upcomingBirthdays = students.filter(s => {
        if (!s.user.birthDate) return false;
        const bdate = new Date(s.user.birthDate);
        bdate.setFullYear(today.getFullYear());
        if (bdate < today && today.getDate() !== bdate.getDate()) {
            bdate.setFullYear(today.getFullYear() + 1);
        }
        const diffDays = Math.ceil((bdate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
    });

    const activityItems = students.slice(0, 5).map((s, i) => ({
        aluna: s.user.name,
        evento: i === 0 ? 'Concluiu o treino de hoje' : i === 1 ? 'Nova avaliação física' : 'Treino agendado',
        tipo: i === 0 ? 'check' as const : i === 1 ? 'clipboard' as const : 'clipboard' as const,
        tempo: i === 0 ? 'Agora' : i === 1 ? '2h atrás' : '5h atrás'
    }));

    return (
        <div className="min-h-screen bg-surface-alt pb-16">
            {/* Hero */}
            <section className="bg-gradient-brand text-white">
                <div className="container mx-auto px-4 md:px-6 py-8">
                    <h1 className="font-display text-2xl md:text-3xl font-bold">Olá, {trainer?.name?.split(' ')[0] || 'Personal'} 👋</h1>
                    <p className="text-white/85 mt-1">Você tem <strong>{pendingAssessments}</strong> alunas com dados incompletos.</p>
                </div>
            </section>

            {/* Metrics */}
            <section className="container mx-auto px-4 md:px-6 -mt-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard label="Alunas ativas" value={students.length} icon={Users} delta={2} deltaLabel="vs mês passado" />
                    <MetricCard label="Treinos gerados" value={38} unit="/mês" icon={Dumbbell} delta={5} />
                    <MetricCard label="Avaliações" value={students.filter(s => s.assessments.length > 0).length} icon={ClipboardCheck} delta={3} />
                    <MetricCard label="Sessões hoje" value={activeWorkouts} icon={Activity} />
                </div>
            </section>

            {/* Birthday Banner */}
            {upcomingBirthdays.length > 0 && (
                <section className="container mx-auto px-4 md:px-6 mt-8">
                    <div className="bg-gradient-brand text-white rounded-2xl p-6 shadow-pink-lg">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <span className="bg-white/20 px-3 py-1 text-xs font-bold text-white rounded-full uppercase tracking-wider">Aniversário</span>
                                <h2 className="font-display text-xl font-bold mt-2">🎉 {upcomingBirthdays[0].user.name} faz aniversário!</h2>
                            </div>
                            <Link href={`/personal/chat?studentId=${upcomingBirthdays[0].id}`}>
                                <GradientButton variant="ghost-light">Mensagem de Parabéns</GradientButton>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Students */}
            <section className="container mx-auto px-4 md:px-6 mt-10">
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                    <div>
                        <h2 className="font-display text-2xl font-bold">Suas alunas</h2>
                        <p className="text-sm text-muted-foreground">Acompanhe a evolução de quem treina com você</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/personal/students"><GradientButton variant="outline">Ver todas</GradientButton></Link>
                        <GradientButton><Plus size={16} /> Nova aluna</GradientButton>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {studentsWithAdherence.slice(0, 6).map(student => (
                        <StudentCard key={student.id} aluna={student} />
                    ))}
                </div>
            </section>

            {/* Activity */}
            <section className="container mx-auto px-4 md:px-6 mt-10 pb-16">
                <h2 className="font-display text-2xl font-bold mb-5">Atividade recente</h2>
                <WorkoutTimeline items={activityItems} />
            </section>
        </div>
    );
}