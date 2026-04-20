import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { analyzeAnamneseAnswers, suggestObjective } from '@/lib/ai/anamnese';

export async function POST(req: Request) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { action, answers, studentName } = body;

        if (action === 'analyze') {
            const result = await analyzeAnamneseAnswers(answers, studentName || 'Aluna');
            return NextResponse.json(result);
        }

        if (action === 'suggestGoal') {
            const result = await suggestObjective(answers);
            return NextResponse.json(result);
        }

        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    } catch (error: any) {
        console.error('AI anamnese error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}