import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { signToken } from '@/lib/auth/jwt';
import { checkRateLimit } from '@/lib/rate-limit';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        let { email, password } = loginSchema.parse(body);
        email = email.toLowerCase().trim();

        const ipKey = `login:${email}`;
        if (!checkRateLimit(ipKey, 'login')) {
            return NextResponse.json({ error: 'Muitas tentativas. Tente novamente em 1 minuto' }, { status: 429 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
            include: { student: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
        }

        const token = await signToken({
            userId: user.id,
            tenantId: user.tenantId,
            role: user.role,
            studentId: user.student?.id
        });

        const response = NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token
        });

        response.cookies.set('mk_app_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
