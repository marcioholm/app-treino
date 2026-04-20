import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { z } from 'zod';

const logSetSchema = z.object({
    workoutLogId: z.string().uuid(),
    workoutExerciseId: z.string().uuid(),
    setNumber: z.number().int().positive(),
    reps: z.number().int().nonnegative().optional(),
    load: z.number().nonnegative().optional(),
});

export async function POST(req: Request) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload || !payload.studentId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const data = logSetSchema.parse(body);

        const log = await prisma.workoutLog.findUnique({
            where: { id: data.workoutLogId },
        });

        if (!log) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const setLog = await prisma.setLog.create({
            data: {
                workoutExerciseId: data.workoutExerciseId,
                workoutLogId: data.workoutLogId,
                setNumber: data.setNumber,
                reps: data.reps,
                load: data.load,
            },
        });

        return NextResponse.json({
            setId: setLog.id,
            setNumber: setLog.setNumber,
        }, { status: 201 });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}