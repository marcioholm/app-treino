import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { sendPushNotification } from '@/lib/push';
import { z } from 'zod';

const messageSchema = z.object({
    content: z.string().min(1).max(2000),
    studentId: z.string().uuid().optional(),
});

export async function POST(req: Request) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload || !payload.tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { content, studentId } = messageSchema.parse(body);

        let studentIdToUse = studentId;
        let senderRole = payload.role as string;

        if (payload.role === 'STUDENT' && payload.studentId) {
            studentIdToUse = payload.studentId;
            senderRole = 'STUDENT';
        }

        if (!studentIdToUse) {
            return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
        }

        let conversation = await prisma.conversation.findUnique({
            where: { tenantId_studentId: { tenantId: payload.tenantId, studentId: studentIdToUse } }
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: { tenantId: payload.tenantId, studentId: studentIdToUse }
            });
        }

        const message = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderId: payload.userId,
                senderRole: senderRole as any,
                content
            }
        });

        // Trigger Push Notification
        if (senderRole === 'STUDENT') {
            const receiver = await prisma.user.findFirst({
                where: { tenantId: payload.tenantId, role: 'TRAINER' }
            });
            if (receiver?.pushSubscription) {
                await sendPushNotification(receiver.pushSubscription, {
                    title: 'Nova Mensagem - M&K',
                    body: 'Uma aluna acabou de enviar uma mensagem.',
                    icon: '/icon.svg',
                    url: `/personal/chat?studentId=${studentIdToUse}`
                });
            }
        } else {
            const receiver = await prisma.student.findUnique({
                where: { id: studentIdToUse }
            });
            if (receiver?.pushSubscription) {
                await sendPushNotification(receiver.pushSubscription, {
                    title: 'Sua treinadora enviou uma mensagem',
                    body: content,
                    icon: '/icon.svg',
                    url: `/student/chat`
                });
            }
        }

        return NextResponse.json(message);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}