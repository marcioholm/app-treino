import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(req: Request) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload || (payload.role !== 'OWNER_PERSONAL' && payload.role !== 'TRAINER')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch global exercises and tenant-specific ones
        const exercises = await prisma.exercise.findMany({
            where: {
                OR: [
                    { tenantId: null },
                    { tenantId: payload.tenantId }
                ]
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json({ exercises });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
