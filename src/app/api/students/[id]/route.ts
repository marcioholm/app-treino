import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    const student = await prisma.student.findUnique({
        where: { id },
        include: {
            user: {
                select: { name: true, email: true }
            },
            assessments: {
                orderBy: { createdAt: 'desc' },
                take: 5
            },
            goals: {
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        }
    });

    if (!student) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const weeklyCheckIns = await (prisma as any).weeklyCheckIn.findMany({
        where: { studentId: id },
        orderBy: { createdAt: 'desc' },
        take: 10
    });

    return NextResponse.json({
        student: {
            ...student,
            weeklyCheckIns
        }
    });
}