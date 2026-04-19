import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(req: Request) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { subscription } = body;
        
        if (!subscription) {
            return NextResponse.json({ error: 'Subscription is missing' }, { status: 400 });
        }

        const stringifiedSub = JSON.stringify(subscription);

        if (payload.role === 'STUDENT' && payload.studentId) {
            await prisma.student.update({
                where: { id: payload.studentId },
                data: { pushSubscription: stringifiedSub }
            });
        } else {
            await prisma.user.update({
                where: { id: payload.userId },
                data: { pushSubscription: stringifiedSub }
            });
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
