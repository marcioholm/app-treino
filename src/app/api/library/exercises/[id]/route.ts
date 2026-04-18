import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('trainer_os_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload || (payload.role !== 'OWNER_PERSONAL' && payload.role !== 'TRAINER')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const id = (await params).id;
        const body = await req.json();

        // Prevent modification of globally seeded exercises (where tenantId is null)
        // A full application might allow copying the global to a tenant specific one here
        const exercise = await prisma.exercise.findUnique({ where: { id } });
        if (!exercise) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const updated = await prisma.exercise.update({
            where: { id },
            data: {
                imageUrl: body.imageUrl !== undefined ? body.imageUrl : undefined,
                videoUrl: body.videoUrl !== undefined ? body.videoUrl : undefined,
                defaultMET: body.defaultMET !== undefined ? body.defaultMET : undefined,
            }
        });

        return NextResponse.json({ exercise: updated });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
