import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generateWorkout } from '@/lib/engine/workout-generator';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tenantId = payload.tenantId;

        try {
            const studentId = (await params).id;

            // Verify student ownership
            const student = await prisma.student.findUnique({ where: { id: studentId } });
            if (!student || student.tenantId !== tenantId) {
                return NextResponse.json({ error: 'Student not found' }, { status: 404 });
            }

            const workout = await generateWorkout({ studentId });

            // Optional: Log audit
            await prisma.auditLog.create({
                data: {
                    tenantId,
                    userId: payload.userId,
                    action: 'WORKOUT_GENERATED',
                    details: { workoutId: workout.id, studentId }
                }
            });

            return NextResponse.json({ workout });
        } catch (error: any) {
            return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Authentication Error' }, { status: 401 });
    }
}
