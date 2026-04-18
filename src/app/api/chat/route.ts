import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(req: Request) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('trainer_os_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let conversation;
        if (payload.role === 'STUDENT' && payload.studentId) {
            conversation = await prisma.conversation.findUnique({
                where: { tenantId_studentId: { tenantId: payload.tenantId, studentId: payload.studentId } },
                include: {
                    messages: { orderBy: { createdAt: 'asc' }, take: 50 },
                    student: { include: { user: true } }
                }
            });
        } else {
            const { searchParams } = new URL(req.url);
            const studentId = searchParams.get('studentId');
            if (!studentId) {
                return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
            }
            conversation = await prisma.conversation.findUnique({
                where: { tenantId_studentId: { tenantId: payload.tenantId, studentId } },
                include: {
                    messages: { orderBy: { createdAt: 'asc' }, take: 50 },
                    student: { include: { user: true } }
                }
            });
        }

        return NextResponse.json(conversation || { messages: [], student: null });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}