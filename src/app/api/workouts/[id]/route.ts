import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const updateSchema = z.object({
    name: z.string().optional(),
    notes: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const tenantId = req.headers.get('x-tenant-id');
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const workoutId = (await params).id;
        const body = await req.json();
        const data = updateSchema.parse(body);

        const workout = await prisma.workout.findUnique({ where: { id: workoutId } });
        if (!workout || workout.tenantId !== tenantId) {
            return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
        }

        const updated = await prisma.workout.update({
            where: { id: workoutId },
            data
        });

        return NextResponse.json({ workout: updated });
    } catch (err) {
        return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }
}
