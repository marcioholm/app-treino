import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tenantId = payload.tenantId;
        const studentId = (await params).id;

        const body = await req.json();
        const { weight, height, goal, level } = body;

        // Verify student belongs to this tenant
        const student = await prisma.student.findUnique({ where: { id: studentId } });
        if (!student || student.tenantId !== tenantId) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        const bmi = weight / (height > 3 ? (height / 100) ** 2 : height ** 2);

        const assessment = await prisma.assessment.create({
            data: {
                studentId,
                weight,
                height,
                bmi,
                date: new Date()
            }
        });

        const goalData = { objective: goal, level: level };

        // Upsert goal since student may have one or none
        const existingGoal = await prisma.goal.findFirst({
            where: { studentId }
        });

        if (existingGoal) {
            await prisma.goal.update({
                where: { id: existingGoal.id },
                data: goalData
            });
        } else {
            await prisma.goal.create({
                data: { studentId, ...goalData, daysPerWeek: 4, hasGymAccess: true, restrictions: [] }
            });
        }

        return NextResponse.json({ assessment });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}
