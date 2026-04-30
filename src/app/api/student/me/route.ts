import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(req: Request) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload || !payload.studentId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const student = await prisma.student.findUnique({
            where: { id: payload.studentId },
            include: { 
                user: true,
                physicalAssessments: {
                    orderBy: { date: 'desc' },
                    include: { bodyMeasurements: true }
                },
                anamnesisAnswers: {
                    include: {
                        question: {
                            include: { section: true }
                        }
                    }
                }
            }
        });

        if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const workoutsCount = await prisma.workoutLog.count({
            where: { session: { workout: { studentId: payload.studentId } } }
        });

        const currentWeight = student.physicalAssessments[0]?.weight || null;
        const previousWeight = student.physicalAssessments[1]?.weight || null;
        const weightDiff = currentWeight && previousWeight ? currentWeight - previousWeight : null;

        return NextResponse.json({
            name: student.user.name,
            email: student.user.email,
            avatarUrl: student.avatarUrl || student.user.avatarUrl,
            stats: {
                workoutsCount,
                currentWeight,
                weightDiff
            },
            anamnesis: student.anamnesisAnswers,
            lastAssessment: student.physicalAssessments[0] || null
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload || !payload.studentId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        
        await prisma.student.update({
            where: { id: payload.studentId },
            data: { avatarUrl: body.avatarUrl }
        });

        await prisma.user.update({
             where: { id: payload.userId },
             data: { avatarUrl: body.avatarUrl }
        });

        return NextResponse.json({ success: true, avatarUrl: body.avatarUrl });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
