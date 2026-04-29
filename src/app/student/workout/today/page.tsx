import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';

export default async function TodayWorkoutRedirect() {
    const cookieStore = await cookies();
    const token = cookieStore.get('mk_app_token')?.value;
    const payload = token ? await verifyToken(token) : null;

    if (!payload || payload.role !== 'STUDENT') {
        redirect('/login');
    }

    const student = await prisma.student.findUnique({
        where: { userId: payload.userId }
    });

    if (!student) redirect('/login');

    // Find the latest published workout
    const workout = await prisma.workout.findFirst({
        where: { studentId: student.id, published: true },
        orderBy: { createdAt: 'desc' },
        include: {
            sessions: {
                orderBy: { order: 'asc' },
                include: {
                    logs: {
                        where: { endedAt: null },
                        orderBy: { startedAt: 'desc' },
                        take: 1
                    }
                }
            }
        }
    });

    if (!workout || workout.sessions.length === 0) {
        redirect('/student/today');
    }

    // Redirect to active session or first session
    const activeSession = (workout as any).sessions.find((s: any) => s.logs.length > 0) || (workout as any).sessions[0];
    
    redirect(`/student/workout/${activeSession.id}`);
}
