import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';

export default async function StudentToday() {
    const cookieStore = await cookies();
    const token = cookieStore.get('trainer_os_token')?.value;
    const payload = token ? await verifyToken(token) : null;

    if (!payload || payload.role !== 'STUDENT') {
        redirect('/login');
    }

    const student = await prisma.student.findUnique({
        where: { userId: payload.userId },
        include: { user: true, anamnesisAnswers: true }
    } as any);

    if (!student) {
        redirect('/login');
    }

    // Check Anamnesis
    if ((student as any).anamnesisAnswers.length === 0) {
        redirect('/student/anamnesis');
    }

    // Check Weekly Check-In (needs every 7 days)
    const lastCheckIn = await (prisma as any).weeklyCheckIn.findFirst({
        where: { studentId: student.id },
        orderBy: { createdAt: 'desc' }
    });

    let needsCheckIn = true;
    if (lastCheckIn) {
        const daysSince = (Date.now() - lastCheckIn.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince < 7) {
            needsCheckIn = false;
        }
    }

    return (
        <div className="p-4 space-y-6 max-w-md mx-auto">
            <header className="pt-4 pb-2">
                <h1 className="text-2xl font-bold text-gray-900">Olá, {(student as any).user.name.split(' ')[0]}! 👋</h1>
                <p className="text-gray-500 mt-1 text-sm">Pronto para o treino de hoje?</p>
            </header>

            {needsCheckIn && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-100 text-orange-600 p-2 rounded-full">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-orange-900 text-sm">Check-in Semanal</h3>
                            <p className="text-xs text-orange-800">Como você está se sentindo nesta semana?</p>
                        </div>
                    </div>
                    <Link href="/student/checkin" className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded-lg shrink-0 transition-colors shadow-sm">
                        Responder
                    </Link>
                </div>
            )}

            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden mt-4">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-8 -mb-8"></div>

                <div className="relative z-10">
                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold tracking-wide uppercase mb-4 backdrop-blur-sm">Treino do Dia</span>

                    <h2 className="text-3xl font-bold mb-2">A - Push</h2>
                    <p className="text-blue-100 text-sm mb-6">Peito, Ombros e Tríceps • 50 min</p>

                    <Link href="/student/workout/mock-id" className="block w-full text-center bg-white text-blue-700 py-3.5 rounded-xl font-bold text-lg shadow-sm hover:bg-gray-50 transition-colors">
                        Iniciar Treino
                    </Link>
                </div>
            </div>

            <div className="pt-2">
                <h3 className="font-bold text-gray-900 mb-4 px-1">Próximos Treinos</h3>
                <div className="space-y-3">
                    {["B - Pull", "C - Legs", "D - Full Body"].map((name, i) => (
                        <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 font-bold">
                                    {name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{name}</p>
                                    <p className="text-xs text-gray-500">Amanhã</p>
                                </div>
                            </div>
                            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
