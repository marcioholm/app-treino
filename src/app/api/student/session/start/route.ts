import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const startSessionSchema = z.object({
    sessionId: z.string().uuid(),
});

export async function POST(req: Request) {
    const studentId = req.headers.get('x-student-id');
    if (!studentId) return NextResponse.json({ error: 'Unauthorized access. Student only.' }, { status: 401 });

    try {
        const body = await req.json();
        const { sessionId } = startSessionSchema.parse(body);

        const session = await prisma.workoutSession.findUnique({
            where: { id: sessionId },
            include: { workout: true }
        });

        if (!session || session.workout.studentId !== studentId) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const workoutLog = await prisma.workoutLog.create({
            data: {
                sessionId,
                startedAt: new Date(),
                lastResumedAt: new Date(),
                activeSeconds: 0
            }
        });

        return NextResponse.json({ logId: workoutLog.id, startedAt: workoutLog.startedAt });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
