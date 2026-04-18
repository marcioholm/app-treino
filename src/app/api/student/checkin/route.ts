import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(req: Request) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload || payload.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { weight, energy, sleep, soreness, motivation, notes } = body;

        const student = await prisma.student.findUnique({
            where: { userId: payload.userId }
        });

        if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

        // Create the CheckIn
        const checkIn = await (prisma as any).weeklyCheckIn.create({
            data: {
                studentId: student.id,
                weight: Number(weight),
                energy: Number(energy),
                sleep: Number(sleep),
                soreness: Number(soreness),
                motivation: Number(motivation),
                notes
            }
        });

        // Also update the assessment weight as a consequence of check-in
        const lastAssessment = await prisma.assessment.findFirst({
            where: { studentId: student.id },
            orderBy: { createdAt: 'desc' }
        });

        if (lastAssessment) {
            await prisma.assessment.create({
                data: {
                    studentId: student.id,
                    weight: Number(weight),
                    height: lastAssessment.height,
                    bmi: Number(weight) / Math.pow(lastAssessment.height > 3 ? lastAssessment.height / 100 : lastAssessment.height, 2)
                }
            });
        }

        return NextResponse.json({ checkIn }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
