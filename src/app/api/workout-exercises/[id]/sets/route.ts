import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const setSchema = z.object({
    workoutLogId: z.string(),
    setNumber: z.number().int().positive(),
    reps: z.number().int().positive().optional(),
    load: z.number().positive().optional(),
    rpe: z.number().int().min(1).max(10).optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const studentId = req.headers.get('x-student-id');
    if (!studentId) return NextResponse.json({ error: 'Unauthorized access. Student only.' }, { status: 401 });

    try {
        const workoutExerciseId = (await params).id;
        const body = await req.json();
        const data = setSchema.parse(body);

        const setLog = await prisma.setLog.create({
            data: {
                workoutExerciseId,
                ...data
            }
        });

        return NextResponse.json({ setLog });
    } catch (err) {
        return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }
}
