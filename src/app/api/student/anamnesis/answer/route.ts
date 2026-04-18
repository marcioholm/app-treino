import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(req: Request) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('trainer_os_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload || payload.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { templateId, answers } = body; // Array of { questionId, answerText, answerArray }

        // Start transaction to save all answers
        await prisma.$transaction(
            answers.map((answer: any) =>
                prisma.anamnesisAnswer.create({
                    data: {
                        studentId: payload.studentId!,
                        templateId: String(templateId),
                        questionId: String(answer.questionId),
                        answerText: answer.answerText || null,
                        answerArray: answer.answerArray || [],
                    }
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
