import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: Request) {
    const studentId = req.headers.get('x-student-id');
    if (!studentId) return NextResponse.json({ error: 'Unauthorized access. Student only.' }, { status: 401 });

    try {
        const { sessionId } = await req.json();

        // Ensure session exists and belongs to student
        const session = await prisma.workoutSession.findUnique({
            where: { id: sessionId },
            include: { workout: true }
        });

        if (!session || session.workout.studentId !== studentId) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        // Start a new log
        const workoutLog = await prisma.workoutLog.create({
            data: {
                sessionId,
                startedAt: new Date(),
                lastResumedAt: new Date(),
                activeSeconds: 0
            }
        });

        return NextResponse.json({ logId: workoutLog.id, startedAt: workoutLog.startedAt });
    } catch (err) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
