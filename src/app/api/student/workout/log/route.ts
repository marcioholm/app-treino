import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { z } from 'zod';

const startSchema = z.object({
    workoutId: z.string().uuid(),
});

export async function POST(req: Request) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload || !payload.studentId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { workoutId } = startSchema.parse(body);

        const workout = await prisma.workout.findUnique({
            where: { id: workoutId },
            include: { sessions: true },
        });

        if (!workout || workout.tenantId !== payload.tenantId) {
            return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
        }

        const firstSessionId = workout.sessions[0]?.id;

        const workoutLog = await prisma.workoutLog.create({
            data: {
                sessionId: firstSessionId,
                startedAt: new Date(),
            },
        });

        return NextResponse.json({
            logId: workoutLog.id,
            sessionId: firstSessionId,
            startedAt: workoutLog.startedAt?.toISOString(),
        }, { status: 201 });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}