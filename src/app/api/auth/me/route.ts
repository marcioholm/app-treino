import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const finalToken = tokenCookie || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);

        if (!finalToken) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }

        const payload = await verifyToken(finalToken);

        if (!payload) {
            return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                tenantId: true,
                tenant: {
                    select: { name: true }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
