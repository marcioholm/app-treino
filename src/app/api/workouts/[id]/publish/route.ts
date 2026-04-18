import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const tenantId = req.headers.get('x-tenant-id');
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const workoutId = (await params).id;

        const workout = await prisma.workout.findUnique({ where: { id: workoutId } });
        if (!workout || workout.tenantId !== tenantId) {
            return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
        }

        const updated = await prisma.workout.update({
            where: { id: workoutId },
            data: { published: true }
        });

        await prisma.auditLog.create({
            data: {
                tenantId,
                userId: req.headers.get('x-user-id') || 'system',
                action: 'WORKOUT_PUBLISHED',
                details: { workoutId }
            }
        });

        return NextResponse.json({ workout: updated });
    } catch (err) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
