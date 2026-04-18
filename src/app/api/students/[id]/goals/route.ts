import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import { Objective, Level } from '@prisma/client';

const goalSchema = z.object({
    objective: z.nativeEnum(Objective),
    level: z.nativeEnum(Level),
    daysPerWeek: z.number().int().min(1).max(7),
    hasGymAccess: z.boolean(),
    restrictions: z.array(z.string()).default([]),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const tenantId = req.headers.get('x-tenant-id');
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const studentId = (await params).id;
        const body = await req.json();
        const data = goalSchema.parse(body);

        const student = await prisma.student.findUnique({ where: { id: studentId } });
        if (!student || student.tenantId !== tenantId) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        const goal = await prisma.goal.create({
            data: {
                studentId,
                ...data
            }
        });

        return NextResponse.json({ goal });
    } catch (err) {
        return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }
}
