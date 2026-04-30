import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(req: Request) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload || payload.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const student = await prisma.student.findUnique({
            where: { userId: payload.userId }
        });

        if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

        // Find the latest published workout for this student
        const workout = await prisma.workout.findFirst({
            where: {
                studentId: student.id,
                published: true
            },
            orderBy: { createdAt: 'desc' },
            include: {
                tenant: {
                    select: {
                        name: true,
                        logoUrl: true,
                        primaryColor: true,
                        secondaryColor: true
                    }
                },
                sessions: {
                    orderBy: { order: 'asc' },
                    include: {
                        exercises: {
                            orderBy: { order: 'asc' },
                            include: { exercise: true, setLogs: true }
                        },
                        logs: {
                            where: { endedAt: null }, // find active logs
                            orderBy: { startedAt: 'desc' },
                            take: 1
                        }
                    }
                }
            }
        });

        if (!workout) {
            return NextResponse.json({ message: 'No active workout found' });
        }

        const sessions = (workout as any).sessions;

        // 1. Check for an unfinished session (active log)
        const unfinishedSession = sessions.find((s: any) => s.logs.length > 0 && !s.logs[0].endedAt);
        if (unfinishedSession) {
            return NextResponse.json({ workout, todaySession: unfinishedSession });
        }

        // 2. Find the last completed session
        // We need to check logs for all sessions to find which one was finished most recently
        const sessionsWithLastLogs = await Promise.all(sessions.map(async (s: any) => {
            const lastLog = await prisma.workoutLog.findFirst({
                where: { sessionId: s.id, endedAt: { not: null } },
                orderBy: { endedAt: 'desc' }
            });
            return { ...s, lastLog };
        }));

        // Sort by lastLog.endedAt to find the absolute last finished session
        const finishedSessions = sessionsWithLastLogs
            .filter(s => s.lastLog)
            .sort((a, b) => b.lastLog.endedAt.getTime() - a.lastLog.endedAt.getTime());

        if (finishedSessions.length > 0) {
            const lastFinishedSession = finishedSessions[0];
            const currentIndex = sessions.findIndex((s: any) => s.id === lastFinishedSession.id);
            
            // Get the next session in order
            const nextIndex = (currentIndex + 1) % sessions.length;
            return NextResponse.json({ workout, todaySession: sessions[nextIndex] });
        }

        // 3. Fallback: return the first session if nothing found
        return NextResponse.json({ workout, todaySession: sessions[0] });
    } catch (err) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
