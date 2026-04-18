import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(req: Request) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload || payload.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tenantId = payload.tenantId!;

        const templates = await prisma.anamnesisTemplate.findFirst({
            where: { tenantId, isDefault: true },
            include: {
                sections: {
                    include: {
                        questions: { orderBy: { order: 'asc' } }
                    },
                    orderBy: { order: 'asc' }
                }
            }
        });

        // Check if student already answered
        const existingAnswers = await prisma.anamnesisAnswer.count({
            where: { studentId: payload.studentId! }
        });

        return NextResponse.json({
            template: templates,
            hasAnswered: existingAnswers > 0
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
