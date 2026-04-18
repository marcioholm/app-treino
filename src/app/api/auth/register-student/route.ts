import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { signToken } from '@/lib/auth/jwt';

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string().optional(),
    trainerId: z.string(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password, phone, trainerId } = registerSchema.parse(body);

        // Verify trainer exists - search by studentCode or id
        let trainer = await prisma.user.findFirst({
            where: { 
                OR: [
                    { id: trainerId },
                    { studentCode: trainerId.toUpperCase() }
                ],
                role: { in: ['TRAINER', 'OWNER_PERSONAL'] }
            },
        });

        if (!trainer) {
            return NextResponse.json({ error: 'Trainer inválido' }, { status: 400 });
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user and student in transaction
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    tenantId: trainer.tenantId,
                    role: 'STUDENT',
                },
            });

            const student = await tx.student.create({
                data: {
                    userId: user.id,
                    tenantId: trainer.tenantId,
                    phone: phone || null,
                },
            });

            return { user, student };
        });

        // Generate token
        const token = await signToken({
            userId: result.user.id,
            tenantId: result.user.tenantId,
            role: 'STUDENT',
            studentId: result.student.id,
        });

        const response = NextResponse.json({
            user: {
                id: result.user.id,
                name: result.user.name,
                email: result.user.email,
                role: 'STUDENT',
            },
            token,
        });

        response.cookies.set('mk_app_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });

        return response;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
        }
        console.error('Register error:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}