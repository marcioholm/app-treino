import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { z } from 'zod';

const questionSchema = z.object({
    sectionId: z.string().uuid(),
    text: z.string().min(1),
    type: z.enum(['TEXT', 'NUMBER', 'BOOLEAN', 'MULTIPLE_CHOICE']),
    required: z.boolean().default(false),
    options: z.array(z.string()).optional(),
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
        const { sectionId, text, type, required, options } = questionSchema.parse(body);

        const section = await prisma.anamnesisSection.findUnique({
            where: { id: sectionId, templateId }
        });

        if (!section) {
            return NextResponse.json({ error: 'Section not found' }, { status: 404 });
        }

        const lastQ = await prisma.anamnesisQuestion.findFirst({
            where: { sectionId },
            orderBy: { order: 'desc' }
        });

        const question = await prisma.anamnesisQuestion.create({
            data: {
                sectionId,
                text,
                type,
                required,
                options: options || [],
                order: (lastQ?.order || 0) + 1
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