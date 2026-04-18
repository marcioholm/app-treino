import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload || payload.role !== 'OWNER_PERSONAL' && payload.role !== 'TRAINER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const templateId = (await params).id;

        const template = await prisma.anamnesisTemplate.findUnique({
            where: { id: templateId, tenantId: payload.tenantId },
            include: {
                sections: {
                    include: {
                        questions: { orderBy: { order: 'asc' } }
                    },
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        return NextResponse.json({ template });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
