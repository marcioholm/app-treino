import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const studentSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    birthDate: z.string().optional(),
});

export async function GET(req: Request) {
    const tenantId = req.headers.get('x-tenant-id');
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const students = await prisma.student.findMany({
        where: { tenantId },
        include: {
            user: {
                select: { name: true, email: true }
            },
            goals: { orderBy: { createdAt: 'desc' }, take: 1 }
        }
    });

    return NextResponse.json({ students });
}

export async function POST(req: Request) {
    const tenantId = req.headers.get('x-tenant-id');
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { name, email, password, birthDate } = studentSchema.parse(body);

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return NextResponse.json({ error: 'E-mail em uso' }, { status: 400 });

        const hashedPassword = await bcrypt.hash(password, 10);

        const student = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: 'STUDENT',
                    tenantId,
                    birthDate: birthDate ? new Date(birthDate) : null
                }
            });

            return await tx.student.create({
                data: {
                    userId: user.id,
                    tenantId
                }
            });
        });

        return NextResponse.json({ student });
    } catch (error) {
        return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
}
