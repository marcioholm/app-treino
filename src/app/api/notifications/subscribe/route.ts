import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(req: Request) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('trainer_os_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload || !payload.studentId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const subscription = await req.json();

        // Store push subscription for the student
        await (prisma as any).student.update({
            where: { id: payload.studentId },
            data: { 
                pushSubscription: JSON.stringify(subscription) 
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Subscribe error:', error);
        return NextResponse.json({ error: 'Erro ao salvar subscription' }, { status: 500 });
    }
}