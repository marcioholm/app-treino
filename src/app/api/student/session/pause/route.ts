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

        if (!log || log.endedAt || log.pausedAt) {
            return NextResponse.json({ error: 'Log not active' }, { status: 400 });
        }

        // Calculate active seconds since lastResume
        const now = new Date();
        const lastResume = log.lastResumedAt || log.startedAt || now;
        const diffInSeconds = Math.floor((now.getTime() - lastResume.getTime()) / 1000);

        const newActiveSeconds = log.activeSeconds + Math.max(0, diffInSeconds);

        const updatedLog = await prisma.workoutLog.update({
            where: { id: logId },
            data: {
                pausedAt: now,
                activeSeconds: newActiveSeconds
            }
        });

        return NextResponse.json({ pausedAt: updatedLog.pausedAt, activeSeconds: updatedLog.activeSeconds });
    } catch (err) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
