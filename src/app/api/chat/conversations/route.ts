import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(req: Request) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload || (payload.role !== 'TRAINER' && payload.role !== 'OWNER_PERSONAL')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const conversations = await prisma.conversation.findMany({
            where: { tenantId: payload.tenantId },
            include: {
                student: { include: { user: true } },
                messages: { orderBy: { createdAt: 'desc' }, take: 1 }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json(conversations);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}