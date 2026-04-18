import { NextResponse } from 'next/server';
import { verifyToken, signToken } from '@/lib/auth/jwt';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        const tokenCookie = req.headers.get('cookie')?.split('trainer_os_token=')[1]?.split(';')[0];
        const finalToken = tokenCookie || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);

        if (!finalToken) {
            return NextResponse.json({ error: 'Nenhum token fornecido' }, { status: 401 });
        }

        // verifyToken returns null if expired, but if we implement true refresh tokens, we might 
        // want to allow loosely expired tokens or have a separate refresh token logic.
        // For simplicity, we just verify the current token to issue a new one if it's still barely valid.
        const payload = await verifyToken(finalToken);

        if (!payload) {
            return NextResponse.json({ error: 'Token expirado' }, { status: 401 });
        }

        const newToken = await signToken({
            userId: payload.userId,
            tenantId: payload.tenantId,
            role: payload.role,
            studentId: payload.studentId
        });

        const response = NextResponse.json({ token: newToken });

        response.cookies.set('trainer_os_token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return response;
    } catch (error) {
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
