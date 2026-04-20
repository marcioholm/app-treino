import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; questionId: string }> }) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const templateId = (await params).id;
        const questionId = (await params).questionId;

        const question = await prisma.anamnesisQuestion.findFirst({
            where: { id: questionId },
            include: { section: true }
        });

        if (!question || question.section.templateId !== templateId) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 });
        }

        await prisma.anamnesisQuestion.delete({ where: { id: questionId } });

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
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}