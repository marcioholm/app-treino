import { prisma } from '@/lib/db/prisma';

export interface PerformanceInsight {
    studentId: string;
    studentName: string;
    type: 'EVOLUTION' | 'ATTENTION' | 'WARNING' | 'NEUTRAL';
    title: string;
    description: string;
    suggestion: string;
    timestamp: Date;
}

export async function generateStudentPerformanceDiagnosis(studentId: string): Promise<PerformanceInsight | null> {
    try {
        // 1. Fetch recent logs and workout plan
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                user: { select: { name: true } },
                workouts: {
                    where: { published: true },
                    orderBy: { updatedAt: 'desc' },
                    take: 1,
                    include: {
                        sessions: {
                            include: {
                                exercises: { include: { exercise: true } },
                                logs: {
                                    orderBy: { endedAt: 'desc' },
                                    take: 3,
                                    include: { setLogs: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!student || !student.workouts[0]) return null;

        const workout = student.workouts[0];
        const allLogs = workout.sessions.flatMap(s => s.logs.filter(l => l.endedAt));
        
        if (allLogs.length === 0) return null;

        // Sort logs by date
        allLogs.sort((a, b) => (b.endedAt?.getTime() || 0) - (a.endedAt?.getTime() || 0));
        
        const latestLog = allLogs[0];
        const previousLog = allLogs[1];

        // 2. Simple Rule-based analysis for now (Base for AI)
        // In a real scenario, we would pass these metrics to an LLM
        let totalPlannedSets = 0;
        let totalCompletedSets = latestLog.setLogs.length;
        
        // Find the session for the latest log
        const currentSession = workout.sessions.find(s => s.id === latestLog.sessionId);
        if (currentSession) {
            totalPlannedSets = currentSession.exercises.reduce((acc, ex) => acc + ex.sets, 0);
        }

        const completionRate = totalPlannedSets > 0 ? (totalCompletedSets / totalPlannedSets) * 100 : 0;
        
        // Check for load evolution (comparing latest vs previous)
        let loadEvolution = 0;
        if (latestLog && previousLog) {
            const latestVolume = latestLog.setLogs.reduce((acc, s) => acc + (s.load || 0) * (s.reps || 0), 0);
            const prevVolume = previousLog.setLogs.reduce((acc, s) => acc + (s.load || 0) * (s.reps || 0), 0);
            loadEvolution = prevVolume > 0 ? ((latestVolume - prevVolume) / prevVolume) * 100 : 0;
        }

        // 3. Construct the Insight (Mocking AI logic for prototype)
        let insight: PerformanceInsight = {
            studentId,
            studentName: student.user.name,
            type: 'NEUTRAL',
            title: 'Análise de Treino',
            description: '',
            suggestion: '',
            timestamp: new Date()
        };

        if (completionRate < 70) {
            insight.type = 'WARNING';
            insight.title = 'Conclusão Parcial Detectada';
            insight.description = `${student.user.name} completou apenas ${completionRate.toFixed(0)}% das séries planejadas no último treino (${currentSession?.name}).`;
            insight.suggestion = 'Verificar se o volume de treino está adequado ou se a aluna está com pouco tempo para treinar.';
        } else if (loadEvolution > 5) {
            insight.type = 'EVOLUTION';
            insight.title = 'Evolução de Carga!';
            insight.description = `${student.user.name} teve um aumento de volume de ${loadEvolution.toFixed(1)}% em comparação ao treino anterior.`;
            insight.suggestion = 'Excelente progresso. Considere parabenizar a aluna para manter a motivação.';
        } else if (loadEvolution < -10) {
            insight.type = 'ATTENTION';
            insight.title = 'Queda de Performance';
            insight.description = `Houve uma redução significativa no volume de carga (${Math.abs(loadEvolution).toFixed(1)}%).`;
            insight.suggestion = 'Verificar se a aluna está cansada, doente ou se houve erro no registro das cargas.';
        } else {
            insight.title = 'Treino Consistente';
            insight.description = `${student.user.name} manteve a consistência e completou o treino planejado com sucesso.`;
            insight.suggestion = 'Manter o plano atual e monitorar as próximas sessões.';
        }

        return insight;
    } catch (error) {
        console.error('Error generating performance diagnosis', error);
        return null;
    }
}

export async function getAllTenantInsights(tenantId: string): Promise<PerformanceInsight[]> {
    const students = await prisma.student.findMany({
        where: { tenantId },
        select: { id: true }
    });

    const insights = await Promise.all(students.map(s => generateStudentPerformanceDiagnosis(s.id)));
    return insights.filter(i => i !== null) as PerformanceInsight[];
}
