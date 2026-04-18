import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(req: Request) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('trainer_os_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload || payload.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { exerciseId, load, wasSuccessful } = body;

        const student = await prisma.student.findUnique({
            where: { userId: payload.userId }
        });

        if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

        // Upsert progression
        const existing = await prisma.exerciseProgression.findUnique({
            where: {
                studentId_exerciseId: { studentId: student.id, exerciseId }
            }
        });

        // Heuristic: If they completed the sets successfully, we might internally suggest +2% next time,
        // but for the database we just store what they actually lifted.
        const newPR = existing ? Math.max(existing.personalRecord || 0, load) : load;

        const progression = await prisma.exerciseProgression.upsert({
            where: {
                studentId_exerciseId: { studentId: student.id, exerciseId }
            },
            update: {
                lastLoad: load,
                personalRecord: newPR
            },
            create: {
                studentId: student.id,
                exerciseId,
                lastLoad: load,
                personalRecord: load
            }
        });

        return NextResponse.json({ progression });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
