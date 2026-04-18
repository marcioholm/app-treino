import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { signToken } from '@/lib/auth/jwt';
import { createDefaultAnamnesisTemplate } from '@/lib/engine/anamnesis-seeder';

const registerSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    tenantName: z.string().min(3),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password, tenantName } = registerSchema.parse(body);

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the tenant and the owner personal within a database transaction
        const { user, token } = await prisma.$transaction(async (tx) => {
            const newTenant = await tx.tenant.create({
                data: { name: tenantName }
            });

            const newUser = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: 'OWNER_PERSONAL',
                    tenantId: newTenant.id
                }
            });

            // Scaffold the new tenant with default systems
            await createDefaultAnamnesisTemplate(tx, newTenant.id);

            const newToken = await signToken({
                userId: newUser.id,
                tenantId: newUser.tenantId,
                role: newUser.role,
            });

            return { user: newUser, token: newToken };
        });

        const response = NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token
        }, { status: 201 });

        response.cookies.set('mk_app_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return response;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
