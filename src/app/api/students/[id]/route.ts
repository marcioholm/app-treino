import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { z } from 'zod';

const updateSchema = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().nullable().optional(),
    birthDate: z.string().nullable().optional(),
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    const student = await prisma.student.findUnique({
        where: { id },
        include: {
            user: {
                select: { name: true, email: true, birthDate: true }
            },
            assessments: {
                orderBy: { createdAt: 'desc' },
                take: 5
            },
            goals: {
                orderBy: { createdAt: 'desc' },
                take: 1
            },
            physicalAssessments: {
                orderBy: { date: 'desc' },
                include: { bodyMeasurements: true },
                take: 5
            },
            anamnesisAnswers: {
                include: {
                    question: { include: { section: true } }
                },
                orderBy: { createdAt: 'desc' }
            },
            workouts: {
                orderBy: { createdAt: 'desc' },
                include: {
                    sessions: {
                        include: {
                            exercises: {
                                include: { exercise: true }
                            }
                        }
                    }
                },
                take: 5
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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const studentId = (await params).id;
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: { user: true }
        });

        if (!student || student.tenantId !== payload.tenantId) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        const body = await req.json();
        const { name, email, phone, birthDate } = updateSchema.parse(body);

        if (name || email || birthDate !== undefined) {
            await prisma.user.update({
                where: { id: student.userId },
                data: {
                    ...(name && { name }),
                    ...(email && { email }),
                    ...(birthDate !== undefined && { birthDate: birthDate ? new Date(birthDate) : null })
                }
            });
        }

        if (phone !== undefined) {
            await prisma.student.update({
                where: { id: studentId },
                data: { phone }
            });
        }

        const updated = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                user: { select: { name: true, email: true, birthDate: true } },
                assessments: { orderBy: { createdAt: 'desc' }, take: 5 },
                goals: { orderBy: { createdAt: 'desc' }, take: 1 },
                physicalAssessments: {
                    orderBy: { date: 'desc' },
                    include: { bodyMeasurements: true },
                    take: 5
                },
                anamnesisAnswers: {
                    include: {
                        question: { include: { section: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        return NextResponse.json({ student: updated });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}