import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';

export default async function StudentHistory({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('mk_app_token')?.value;
    const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

    if (!payload) {
        return <div className="p-6 text-red-500">Acesso negado.</div>;
    }

    const student = await prisma.student.findUnique({
        where: { id },
        include: {
            user: true,
            workouts: {
                include: {
                    sessions: {
                        include: {
                            logs: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!student) {
        return <div className="p-6 text-gray-400">Aluno não encontrado.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/personal/students/${id}`} className="text-gray-400 hover:text-white">
                    &larr; Voltar
                </Link>
                <h1 className="text-2xl font-bold text-white">Histórico de Treinos</h1>
            </div>

            <div className="bg-[#111111] rounded-xl border border-[#333333] p-6">
                <h2 className="text-lg font-semibold text-white mb-4">{student.user.name}</h2>
                
                {student.workouts.length === 0 ? (
                    <p className="text-gray-400">Nenhum treino encontrado.</p>
                ) : (
                    <div className="space-y-4">
                        {student.workouts.map(workout => (
                            <div key={workout.id} className="border-b border-[#333333] pb-4">
                                <p className="font-medium text-white">{workout.name}</p>
                                <p className="text-sm text-gray-400">
                                    {workout.sessions.length} sessões
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}