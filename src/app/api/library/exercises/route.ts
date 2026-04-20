import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

const getCachedExercises = unstable_cache(
    async (tenantId: string | null) => {
        return prisma.exercise.findMany({
            where: {
                OR: [
                    { tenantId: null },
                    { tenantId }
                ]
            },
            orderBy: { name: 'asc' }
        });
    },
    ['exercises-library'],
    { revalidate: 300 }
);

export async function GET(req: Request) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload || (payload.role !== 'OWNER_PERSONAL' && payload.role !== 'TRAINER')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const exercises = await getCachedExercises(payload.tenantId);

        return NextResponse.json({ exercises });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
