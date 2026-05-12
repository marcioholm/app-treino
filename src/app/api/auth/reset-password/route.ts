import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const resetSchema = z.object({
    email: z.string().email(),
    trainerCode: z.string(),
    newPassword: z.string().min(6),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, trainerCode, newPassword } = resetSchema.parse(body);

        // 1. Find the trainer by studentCode (this is the "código do personal")
        const trainer = await prisma.user.findFirst({
            where: {
                studentCode: trainerCode.toUpperCase(),
                role: { in: ['TRAINER', 'OWNER_PERSONAL'] }
            }
        });

        if (!trainer) {
            return NextResponse.json({ error: 'Código do personal inválido' }, { status: 400 });
        }

        // 2. Find the user by email
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                student: true
            }
        });

        if (!user || user.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 });
        }

        // 3. Verify if the student is associated with this trainer
        if (user.student?.trainerId !== trainer.id) {
            return NextResponse.json({ error: 'Este aluno não está vinculado a este personal' }, { status: 403 });
        }

        // 4. Update the password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        return NextResponse.json({ message: 'Senha redefinida com sucesso' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
        }
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
