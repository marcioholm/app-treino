import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const completeSchema = z.object({
    workoutLogId: z.string().optional(), // if an active log exists
    rpeFinal: z.number().min(1).max(10), // mandatory on complete
    notes: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const studentId = req.headers.get('x-student-id');
    if (!studentId) return NextResponse.json({ error: 'Unauthorized access. Student only.' }, { status: 401 });

    try {
        const sessionId = (await params).id;
        const body = await req.json();
        const data = completeSchema.parse(body);

        // Verify session belongs to a workout of this student
        const session = await prisma.workoutSession.findUnique({
            where: { id: sessionId },
            include: { workout: true }
        });

        if (!session || session.workout.studentId !== studentId) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        let workoutLog;
        let finalActiveSeconds = 0;

        if (data.workoutLogId) {
            const log = await prisma.workoutLog.findUnique({ where: { id: data.workoutLogId } });
            if (!log) return NextResponse.json({ error: 'Log not found' }, { status: 404 });

            // Calculate active seconds up to now
            const now = new Date();
            let addedSeconds = 0;
            if (!log.pausedAt) {
                const lastResume = log.lastResumedAt || log.startedAt || now;
                addedSeconds = Math.floor((now.getTime() - lastResume.getTime()) / 1000);
            }
            finalActiveSeconds = log.activeSeconds + Math.max(0, addedSeconds);
        } else {
            // No log provided, default 30 mins
            finalActiveSeconds = 30 * 60;
        }

        // Get student weight to calculate calories
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: { assessments: { orderBy: { date: 'desc' }, take: 1 } }
        });
        const weight = student?.assessments[0]?.weight || 75;

        // Determine MET base 
        // A real app would count modalities from session.exercises. For MVP we assume Gym (3.5)
        const MET_base = 3.5;

        // Multiply by RPE
        // RPE 1-3 => 0.85
        // RPE 4-6 => 1.00
        // RPE 7-8 => 1.15
        // RPE 9-10 => 1.30
        let rpeMult = 1.0;
        if (data.rpeFinal <= 3) rpeMult = 0.85;
        else if (data.rpeFinal <= 6) rpeMult = 1.0;
        else if (data.rpeFinal <= 8) rpeMult = 1.15;
        else rpeMult = 1.30;

        const MET_final = MET_base * rpeMult;
        const activeMinutes = finalActiveSeconds / 60;
        const caloriesEstimated = (MET_final * 3.5 * weight / 200) * activeMinutes;

        if (data.workoutLogId) {
            workoutLog = await prisma.workoutLog.update({
                where: { id: data.workoutLogId },
                data: {
                    endedAt: new Date(),
                    pausedAt: null, // ensure paused is null
                    activeSeconds: finalActiveSeconds,
                    rpeFinal: data.rpeFinal,
                    caloriesEstimated: caloriesEstimated,
                    calorieMethod: "MET_V1",
                    notes: data.notes
                }
            });
        } else {
            workoutLog = await prisma.workoutLog.create({
                data: {
                    sessionId,
                    endedAt: new Date(),
                    activeSeconds: finalActiveSeconds,
                    rpeFinal: data.rpeFinal,
                    caloriesEstimated: caloriesEstimated,
                    calorieMethod: "MET_V1",
                    notes: data.notes
                }
            });
        }

        return NextResponse.json({ workoutLog });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: 'Invalid data', details: err.message }, { status: 400 });
    }
}
