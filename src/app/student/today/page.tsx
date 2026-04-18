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

    const student: any = await prisma.student.findUnique({
        where: { userId: payload.userId },
        include: { user: true, anamnesisAnswers: true }
    });

    if (!student) {
        redirect('/login');
    }

    if (student.anamnesisAnswers.length === 0) {
        redirect('/student/anamnesis');
    }

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
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#D4537E] to-[#993556] rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">M&K</span>
                    </div>
                    <span className="text-xs text-[#D4537E] font-medium">M&K Fitness</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Olá, {student.user.name.split(' ')[0]}! 💪</h1>
                <p className="text-gray-500 mt-1 text-sm">Vamos continuar evoluindo?</p>
            </header>

            {needsCheckIn && (
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#D4537E]/10 text-[#D4537E] p-2 rounded-full">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-[#1a1a1a] text-sm">Check-in Semanal</h3>
                            <p className="text-xs text-gray-500">Como você está se sentindo?</p>
                        </div>
                    </div>
                    <Link href="/student/checkin" className="bg-[#D4537E] hover:bg-[#993556] text-white text-xs font-bold px-4 py-2 rounded-lg shrink-0 transition-colors shadow-sm">
                        Responder
                    </Link>
                </div>
            )}

            <div className="bg-gradient-to-br from-[#D4537E] to-[#993556] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden mt-4">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-8 -mb-8"></div>

                <div className="relative z-10">
                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold tracking-wide uppercase mb-4 backdrop-blur-sm">Treino do Dia</span>

                    <h2 className="text-3xl font-bold mb-2">A - Push</h2>
                    <p className="text-pink-100 text-sm mb-6">Peito, Ombros e Tríceps • 50 min</p>

                    <Link href="/student/workout/mock-id" className="block w-full text-center bg-white text-[#D4537E] py-3.5 rounded-xl font-bold text-lg shadow-sm hover:bg-gray-50 transition-colors">
                        Iniciar Treino
                    </Link>
                </div>
            </div>

            <div className="pt-2">
                <h3 className="font-bold text-gray-900 mb-4 px-1">Próximos Treinos</h3>
                <div className="space-y-3">
                    {["B - Pull", "C - Legs", "D - Full Body"].map((name, i) => (
                        <div key={i} className="bg-white p-4 rounded-xl border border-pink-100 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center text-[#D4537E] font-bold">
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
                    
                    <Link href="/student/chat" className="bg-white p-4 rounded-xl border border-pink-100 flex items-center justify-between shadow-sm hover:bg-pink-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center">
                                <svg className="w-5 h-5 text-[#D4537E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Mensagens</p>
                                <p className="text-xs text-gray-500">Fale com sua coach</p>
                            </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}