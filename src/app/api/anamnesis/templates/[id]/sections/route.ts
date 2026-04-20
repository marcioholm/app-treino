import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { z } from 'zod';

const sectionSchema = z.object({
    name: z.string().min(1),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const templateId = (await params).id;
        const template = await prisma.anamnesisTemplate.findUnique({
            where: { id: templateId, tenantId: payload.tenantId }
        });

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        const body = await req.json();
        const { name } = sectionSchema.parse(body);

        const lastSection = await prisma.anamnesisSection.findFirst({
            where: { templateId },
            orderBy: { order: 'desc' }
        });

        const section = await prisma.anamnesisSection.create({
            data: {
                templateId,
                name,
                order: (lastSection?.order || 0) + 1
            }
        });

        const updated = await prisma.anamnesisTemplate.findUnique({
            where: { id: templateId },
            include: {
                sections: {
                    include: { questions: true },
                    orderBy: { order: 'asc' }
                }
            }
        });

        return NextResponse.json({ template: updated });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}