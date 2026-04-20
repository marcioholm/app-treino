import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; sectionId: string }> }) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const templateId = (await params).id;
        const sectionId = (await params).sectionId;

        const section = await prisma.anamnesisSection.findUnique({
            where: { id: sectionId, templateId }
        });

        if (!section) {
            return NextResponse.json({ error: 'Section not found' }, { status: 404 });
        }

        await prisma.anamnesisQuestion.deleteMany({ where: { sectionId } });
        await prisma.anamnesisSection.delete({ where: { id: sectionId } });

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