import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(req: Request) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('trainer_os_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload || payload.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const student = await prisma.student.findUnique({
            where: { userId: payload.userId }
        });

        if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

        const body = await req.json();
        const { sessionId, activeSeconds, rpeFinal, setLogs } = body;

        // 1. Create WorkoutLog
        const workoutLog = await prisma.workoutLog.create({
            data: {
                sessionId,
                activeSeconds,
                rpeFinal,
                endedAt: new Date(),
            }
        });

        // 2. Create SetLogs and Update Progressions
        const setLogPromises = setLogs.map(async (log: any) => {
            const { workoutExerciseId, exerciseId, setNumber, reps, load } = log;

            // Save the individual set log
            await prisma.setLog.create({
                data: {
                    workoutLogId: workoutLog.id,
                    workoutExerciseId,
                    setNumber,
                    reps,
                    load
                }
            });

            // Update progression for this exercise
            // We only update if this load is higher than previous or if it's successful
            // For now, simplicity: update lastLoad and potentially PR
            const existingProg = await prisma.exerciseProgression.findUnique({
                where: { studentId_exerciseId: { studentId: student.id, exerciseId } }
            });

            const newPR = existingProg ? Math.max(existingProg.personalRecord || 0, load) : load;

            await prisma.exerciseProgression.upsert({
                where: { studentId_exerciseId: { studentId: student.id, exerciseId } },
                update: {
                    lastLoad: load,
                    personalRecord: newPR
                },
                create: {
                    studentId: student.id,
                    exerciseId,
                    lastLoad: load,
                    personalRecord: load
                }
            });
        });

        await Promise.all(setLogPromises);

        return NextResponse.json({ success: true, workoutLogId: workoutLog.id });
    } catch (error: any) {
        console.error('Session matching error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
