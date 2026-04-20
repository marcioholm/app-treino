import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { z } from 'zod';

const completeSchema = z.object({
    workoutLogId: z.string().uuid(),
    notes: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload || !payload.studentId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { workoutLogId, notes } = completeSchema.parse(body);

        const log = await prisma.workoutLog.findUnique({
            where: { id: workoutLogId },
            include: { setLogs: true },
        });

        if (!log) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const endedAt = new Date();
        const totalSeconds = log.startedAt 
            ? Math.round((endedAt.getTime() - log.startedAt.getTime()) / 1000)
            : 0;

        const totalVolume = log.setLogs.reduce((sum, s) => {
            if (s.load && s.reps) return sum + (s.load * s.reps);
            return sum;
        }, 0);

        await prisma.workoutLog.update({
            where: { id: workoutLogId },
            data: { endedAt, totalSeconds, notes },
        });

        return NextResponse.json({
            completed: true,
            durationMinutes: Math.round(totalSeconds / 60),
            totalVolume,
            totalSets: log.setLogs.length,
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}