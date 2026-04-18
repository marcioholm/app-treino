import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(req: Request) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('trainer_os_token=')[1]?.split(';')[0];
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

        // Simplistic Logic: "today's session" is just the next one they should do, or one they started.
        const activeSession = (workout as any).sessions.find((s: any) => s.logs.length > 0) || (workout as any).sessions[0];

        return NextResponse.json({ workout, todaySession: activeSession });
    } catch (err) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
