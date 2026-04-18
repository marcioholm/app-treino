import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: Request) {
    const studentId = req.headers.get('x-student-id');
    if (!studentId) return NextResponse.json({ error: 'Unauthorized access. Student only.' }, { status: 401 });

    try {
        const { logId } = await req.json();

        const log = await prisma.workoutLog.findUnique({
            where: { id: logId }
        });

        if (!log || log.endedAt || !log.pausedAt) {
            return NextResponse.json({ error: 'Log not paused' }, { status: 400 });
        }

        const now = new Date();

        const updatedLog = await prisma.workoutLog.update({
            where: { id: logId },
            data: {
                pausedAt: null,
                lastResumedAt: now
            }
        });

        return NextResponse.json({ lastResumedAt: updatedLog.lastResumedAt, activeSeconds: updatedLog.activeSeconds });
    } catch (err) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
