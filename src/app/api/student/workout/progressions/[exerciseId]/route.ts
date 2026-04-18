import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(req: Request, { params }: { params: Promise<{ exerciseId: string }> }) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload || payload.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const student = await prisma.student.findUnique({
            where: { userId: payload.userId }
        });

        if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

        const exerciseId = (await params).exerciseId;

        const progression = await prisma.exerciseProgression.findUnique({
            where: {
                studentId_exerciseId: { studentId: student.id, exerciseId }
            }
        });

        if (!progression) {
            return NextResponse.json({ progression: null });
        }

        // Auto progression suggestion heuristic: +2% by default
        const suggestedLoad = progression.lastLoad ? Number((progression.lastLoad * 1.02).toFixed(1)) : null;

        return NextResponse.json({
            progression: {
                ...progression,
                suggestedLoad
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
