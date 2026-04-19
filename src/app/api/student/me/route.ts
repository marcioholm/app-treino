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
            include: { user: true }
        });

        if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json({
            name: student.user.name,
            email: student.user.email,
            avatarUrl: student.avatarUrl || student.user.avatarUrl
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
