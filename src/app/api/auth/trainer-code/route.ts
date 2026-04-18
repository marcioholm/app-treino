import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(req: Request) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('trainer_os_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload || (payload.role !== 'TRAINER' && payload.role !== 'OWNER_PERSONAL')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const trainer = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { 
                id: true, 
                tenantId: true, 
                name: true,
                studentCode: true 
            },
        });

        // Generate code if not exists (first 8 chars of user ID)
        let studentCode = trainer?.studentCode;
        if (!studentCode && trainer) {
            studentCode = trainer.id.slice(0, 8).toUpperCase();
            await prisma.user.update({
                where: { id: trainer.id },
                data: { studentCode },
            });
        }

        return NextResponse.json({ 
            trainerId: trainer?.id,
            studentCode 
        });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}