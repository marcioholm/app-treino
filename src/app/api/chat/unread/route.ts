import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(req: Request) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Wait, what role is asking?
        // If trainer, find all unread where sender is STUDENT
        // If student, find all unread where sender is TRAINER/OWNER
        const isStudent = payload.role === 'STUDENT';
        
        let count = 0;
        
        if (isStudent && payload.studentId) {
            count = await prisma.message.count({
                where: {
                    conversation: { studentId: payload.studentId },
                    senderRole: { in: ['TRAINER', 'OWNER_PERSONAL'] },
                    read: false
                }
            });
        } else if (!isStudent) {
            count = await prisma.message.count({
                where: {
                    conversation: { tenantId: payload.tenantId },
                    senderRole: 'STUDENT',
                    read: false
                }
            });
        }

        return NextResponse.json({ count });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
