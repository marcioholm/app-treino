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

    const notifications = await prisma.notification.findMany({
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
            adherence
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
        <div className="min-h-screen bg-background pb-24">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-12 pb-20 animate-fade-in">
                {/* Background Blobs */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[100px]" />
                
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-up">
                        <div>
                            <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight text-white leading-[1.1]">
                                Olá, <span className="text-gradient-brand">{trainer?.name?.split(' ')[0] || 'Personal'}</span> 👋
                            </h1>
                            <p className="text-muted-foreground mt-4 text-lg font-medium max-w-md">
                                Você tem <span className="text-white font-bold">{pendingAssessments}</span> alunas aguardando avaliação.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <GradientButton size="md" variant="outline">
                                <Activity size={18} /> Relatórios
                            </GradientButton>
                            <GradientButton size="md">
                                <Plus size={18} /> Nova Aluna
                            </GradientButton>
                        </div>
                    </div>
                </div>
            </section>

            {/* Metrics */}
            <section className="container mx-auto px-4 md:px-6 -mt-8 relative z-20 animate-fade-up stagger-1">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard label="Alunas ativas" value={students.length} iconName="users" delta={2} deltaLabel="vs mês passado" />
                    <MetricCard label="Treinos gerados" value={38} unit="/mês" iconName="dumbbell" delta={5} />
                    <MetricCard label="Avaliações" value={students.filter(s => s.assessments.length > 0).length} iconName="clipboard" delta={3} />
                    <MetricCard label="Sessões hoje" value={activeWorkouts} iconName="activity" />
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

            {/* Students Grid */}
            <section className="container mx-auto px-4 md:px-6 mt-16">
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <div>
                        <h2 className="font-display text-3xl font-black tracking-tight text-white">Suas Alunas</h2>
                        <p className="text-muted-foreground font-medium mt-1">Acompanhe a evolução e o engajamento</p>
                    </div>
                    <Link href="/personal/students">
                        <GradientButton variant="ghost" className="text-primary-light font-bold">
                            Ver todas as alunas &rarr;
                        </GradientButton>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {studentsWithAdherence.slice(0, 6).map(student => (
                        <StudentCard key={student.id} aluna={student} />
                    ))}
                </div>
            </section>

            {/* Activity Timeline */}
            <section className="container mx-auto px-4 md:px-6 mt-20 pb-24">
                <div className="flex items-center gap-3 mb-10">
                    <div className="size-10 rounded-xl bg-primary/10 grid place-items-center text-primary-light">
                        <Activity size={22} />
                    </div>
                    <h2 className="font-display text-3xl font-black tracking-tight text-white">Atividade Recente</h2>
                </div>
                <div className="bg-glass rounded-[2rem] p-8 md:p-12">
                    <WorkoutTimeline items={activityItems} />
                </div>
            </section>
        </div>
    );
}