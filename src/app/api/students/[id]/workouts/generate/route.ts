import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generateWorkout } from '@/lib/engine/workout-generator';
import { verifyToken } from '@/lib/auth/jwt';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const ipKey = `generate:${payload.userId}`;
        if (!checkRateLimit(ipKey, 'generate')) {
            return NextResponse.json({ error: 'Muitas tentativas. Tente novamente em 1 minuto' }, { status: 429 });
        }

        const tenantId = payload.tenantId;
        let studentId = '';

        try {
            studentId = (await params).id;

            const student = await prisma.student.findUnique({ where: { id: studentId } });
            if (!student || student.tenantId !== tenantId) {
                return NextResponse.json({ error: 'Student not found' }, { status: 404 });
            }

            const workout = await generateWorkout({ studentId });

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
            console.error('Workout generation error:', error);
            if (studentId) {
                await prisma.auditLog.create({
                    data: {
                        tenantId,
                        userId: payload.userId,
                        action: 'WORKOUT_GENERATION_FAILED',
                        details: { error: error.message, studentId }
                    }
                });
            }
            return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Authentication Error' }, { status: 401 });
    }
}
