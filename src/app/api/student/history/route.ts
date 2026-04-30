import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(req: Request) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload || !payload.studentId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const logs = await prisma.workoutLog.findMany({
            where: {
                session: {
                    workout: {
                        studentId: payload.studentId
                    }
                },
                endedAt: { not: null }
            },
            include: {
                session: {
                    include: {
                        workout: true
                    }
                },
                setLogs: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate volume for each log
        const logsWithStats = logs.map(log => {
            const totalVolume = log.setLogs.reduce((acc, set) => {
                const load = set.load || 0;
                const reps = set.reps || 0;
                return acc + (load * reps);
            }, 0);

            return {
                id: log.id,
                workoutName: log.session.workout.name,
                sessionName: log.session.name,
                date: log.createdAt,
                durationMinutes: Math.floor((log.totalSeconds || 0) / 60),
                volume: totalVolume,
                rpe: log.rpeFinal
            };
        });

        return NextResponse.json(logsWithStats);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
