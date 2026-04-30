import { prisma } from '@/lib/db/prisma';
import { callOpenRouter } from '@/lib/ai/openrouter';

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

        allLogs.sort((a, b) => (b.endedAt?.getTime() || 0) - (a.endedAt?.getTime() || 0));
        const latestLog = allLogs[0];
        const previousLog = allLogs[1];

        // 1. Calculate Metrics
        const currentSession = workout.sessions.find(s => s.id === latestLog.sessionId);
        const totalPlannedSets = currentSession?.exercises.reduce((acc, ex) => acc + ex.sets, 0) || 0;
        const totalCompletedSets = latestLog.setLogs.length;
        const completionRate = totalPlannedSets > 0 ? (totalCompletedSets / totalPlannedSets) * 100 : 0;
        
        let loadEvolution = 0;
        if (latestLog && previousLog) {
            const latestVolume = latestLog.setLogs.reduce((acc, s) => acc + (s.load || 0) * (s.reps || 0), 0);
            const prevVolume = previousLog.setLogs.reduce((acc, s) => acc + (s.load || 0) * (s.reps || 0), 0);
            loadEvolution = prevVolume > 0 ? ((latestVolume - prevVolume) / prevVolume) * 100 : 0;
        }

        // 2. Call AI (OpenRouter) for human-like diagnosis
        const systemPrompt = `
Você é o Assistente de Performance de Elite da M&K Fitness Center.
Sua tarefa é analisar métricas de treino de uma aluna e fornecer um diagnóstico profissional e sugestões estratégicas para o Personal Trainer.
Responda com um JSON contendo: title, description, suggestion e type (EVOLUTION, ATTENTION, WARNING, NEUTRAL).
`.trim();

        const userPrompt = `
DADOS DO ÚLTIMO TREINO:
- Aluna: ${student.user.name}
- Sessão: ${currentSession?.name || 'N/A'}
- Taxa de Conclusão: ${completionRate.toFixed(1)}%
- Evolução de Carga (Volume Total): ${loadEvolution.toFixed(1)}%
- Séries Planejadas: ${totalPlannedSets}
- Séries Concluídas: ${totalCompletedSets}

Instruções:
- Se a conclusão for baixa (< 70%), use type WARNING.
- Se houver grande evolução (> 5%), use type EVOLUTION.
- Se houver grande queda (< -10%), use type ATTENTION.
- Escreva de forma profissional e motivadora para o Personal.
`.trim();

        let insight: PerformanceInsight;

        try {
            const aiResponse = await callOpenRouter(userPrompt, {
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.3 // More precise
            });

            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                insight = {
                    studentId,
                    studentName: student.user.name,
                    type: parsed.type || 'NEUTRAL',
                    title: parsed.title || 'Análise de Treino',
                    description: parsed.description || '',
                    suggestion: parsed.suggestion || '',
                    timestamp: new Date()
                };
            } else {
                throw new Error('Fallback needed');
            }
        } catch (e) {
            // Fallback to basic logic if AI fails
            insight = {
                studentId,
                studentName: student.user.name,
                type: completionRate < 70 ? 'WARNING' : loadEvolution > 5 ? 'EVOLUTION' : 'NEUTRAL',
                title: 'Análise de Performance',
                description: `${student.user.name} concluiu ${completionRate.toFixed(0)}% do treino com uma variação de volume de ${loadEvolution.toFixed(1)}%.`,
                suggestion: 'Verifique o engajamento e a carga na próxima sessão.',
                timestamp: new Date()
            };
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
