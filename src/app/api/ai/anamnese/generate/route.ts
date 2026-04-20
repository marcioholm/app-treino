import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { generateAnamneseQuestions } from '@/lib/ai/anamnese';

export async function POST(req: Request) {
    try {
        const tokenCookie = req.headers.get('cookie')?.split('mk_app_token=')[1]?.split(';')[0];
        const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { goal, level } = body;

        const result = await generateAnamneseQuestions(goal || 'Hipertrofia', level || 'Intermediário');
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('AI generate questions error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}