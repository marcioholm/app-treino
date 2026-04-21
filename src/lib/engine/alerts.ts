import { prisma } from '../db/prisma';

export async function generateTrainerAlerts(tenantId: string) {
    // 1. Fetch relevant data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const students = await prisma.student.findMany({
        where: { tenantId },
        include: {
            user: true,
            goals: { orderBy: { createdAt: 'desc' }, take: 1 },
            workouts: {
                include: {
                    sessions: {
                        include: {
                            logs: {
                                orderBy: { createdAt: 'desc' },
                                take: 1
                            }
                        }
                    }
                }
            }
        }
    });

    for (const student of students) {
        // Find newest log across all workouts/sessions
        const allLogs = student.workouts.flatMap(w => w.sessions.flatMap(s => s.logs));
        allLogs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        const lastLog = allLogs[0];

        // System Rule 1: Inactive > 3 days
        if (!lastLog || lastLog.createdAt < threeDaysAgo) {
            // Student is inactive. Check if we already have an unresolved alert.
            const existingAlert = await prisma.notification.findFirst({
                where: {
                    tenantId,
                    type: 'INACTIVE_STUDENT',
                    resolved: false,
                    message: { contains: student.user.name }
                }
            });

            if (!existingAlert) {
                await prisma.notification.create({
                    data: {
                        tenantId,
                        title: 'Atenção: Aluno Inativo',
                        message: `O aluno ${student.user.name} não treina há mais de 3 dias.`,
                        type: 'INACTIVE_STUDENT',
                        priority: 'HIGH',
                        linkUrl: `/personal/students/${student.id}`
                    }
                });
            }
        }

        // We could calculate Adherence drops here too, but we need the full 30 day logs for that.
        // For performance in MVP, we skip complex adherence history checks here and just use the 3 day inactivity.
    }
}
