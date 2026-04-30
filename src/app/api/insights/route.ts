import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { InsightStatus, InsightType } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as InsightStatus | null;
    const type = searchParams.get('type') as InsightType | null;
    const studentId = searchParams.get('studentId');

    const cookieStore = await import('next/headers').then(m => m.cookies());
    const tokenCookie = cookieStore.get('mk_app_token')?.value;
    const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

    if (!payload || (payload.role !== 'TRAINER' && payload.role !== 'OWNER_PERSONAL')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 401 });
    }

    const insights = await prisma.aiTrainingInsight.findMany({
      where: {
        tenantId: payload.tenantId,
        ...(status && { status }),
        ...(type && { type }),
        ...(studentId && { studentId })
      },
      include: {
        workoutSession: {
          include: {
            exerciseLogs: true,
            skippedExercises: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const insightsWithStudents = await Promise.all(
      insights.map(async (insight) => {
        const student = await prisma.user.findUnique({
          where: { id: insight.studentId },
          select: { name: true, email: true }
        });
        return {
          ...insight,
          studentName: student?.name || 'Aluno'
        };
      })
    );

    return NextResponse.json({ insights: insightsWithStudents });
  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}