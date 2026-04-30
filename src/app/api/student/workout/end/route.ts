import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { z } from 'zod';
import { completeWorkoutSessionTracking } from '@/lib/engine/training-analytics';

const completeSchema = z.object({
    workoutLogId: z.string(),
    activeSeconds: z.number().optional(),
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
        const { workoutLogId, activeSeconds, notes } = completeSchema.parse(body);

        const log = await prisma.workoutLog.findUnique({
            where: { id: workoutLogId },
            include: { 
                setLogs: true,
                session: {
                    include: {
                        workout: true,
                        exercises: true
                    }
                }
            },
        });

        if (!log) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const endedAt = new Date();
        const finalSeconds = activeSeconds || (log.startedAt 
            ? Math.round((endedAt.getTime() - log.startedAt.getTime()) / 1000)
            : 0);

        const totalVolume = log.setLogs.reduce((sum, s) => {
            if (s.load && s.reps) return sum + (s.load * s.reps);
            return sum;
        }, 0);

        const student = await prisma.student.findUnique({
            where: { id: payload.studentId },
            include: { user: true }
        });

        await prisma.workoutLog.update({
            where: { id: workoutLogId },
            data: { 
                endedAt, 
                totalSeconds: finalSeconds, 
                activeSeconds: finalSeconds,
                notes 
            },
        });

        const tracking = await prisma.workoutSessionTracking.findFirst({
            where: {
                studentId: student?.userId,
                workoutSessionId: log.sessionId,
                status: 'STARTED'
            }
        });

        if (tracking) {
            const totalExercises = log.session?.exercises?.length || 0;
            const completedExercises = log.setLogs.filter(sl => sl.reps && sl.reps > 0).length;
            const percentage = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

            await completeWorkoutSessionTracking({
                trackingId: tracking.id,
                completedPercentage: percentage
            });
        }

        return NextResponse.json({
            completed: true,
            studentName: student?.user?.name || 'atleta',
            durationMinutes: Math.round(finalSeconds / 60),
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