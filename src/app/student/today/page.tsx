import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';
import ManifestoBanner from '@/components/ManifestoBanner';
import MKLogo from '@/components/MKLogo';

export default async function StudentToday() {
    const cookieStore = await cookies();
    const token = cookieStore.get('mk_app_token')?.value;
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
        <div className="p-4 space-y-5 max-w-md mx-auto">
            {/* Header */}
            <header className="pt-4 pb-2">
                <div className="flex items-center gap-3 mb-4">
                    <MKLogo size="md" />
                    <div>
                        <span className="text-xs text-[#D4537E] font-medium">M&K Fitness Center</span>
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Olá, {student.user.name.split(' ')[0]}! 💪
                </h1>
                <p className="text-gray-500 mt-1 text-sm">Vamos arrasar no treino hoje?</p>
            </header>

            {/* Manifesto Banner */}
            <ManifestoBanner />

            {/* Check-in Reminder */}
            {needsCheckIn && (
                <Link 
                    href="/student/checkin" 
                    className="block bg-gradient-to-r from-[#FBEAF0] to-[#FDE8EE] border border-[#F4C0D1] rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#D4537E]/10 flex items-center justify-center">
                            <svg className="w-7 h-7 text-[#D4537E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-[#1a1a1a]">Check-in Semanal</h3>
                            <p className="text-sm text-gray-500">Como você está se sentindo?</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#D4537E] flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </Link>
            )}

            {/* Today's Workout Card */}
            <Link href="/student/workout/mock-id" className="block group">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 group-hover:scale-[1.02]">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#D4537E] via-[#993556] to-[#72243E]" />
                    
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -ml-10 -mb-10" />
                    <div className="absolute top-1/2 right-8 w-24 h-24 border border-white/10 rounded-full" />
                    
                    <div className="relative z-10 p-6 pt-8">
                        <span className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-xs font-semibold tracking-wide uppercase mb-4 backdrop-blur-sm">
                            Treino do Dia
                        </span>

                        <h2 className="text-3xl font-bold text-white mb-2">A - Push</h2>
                        <p className="text-pink-100 text-base mb-6">Peito, Ombros e Tríceps • ~50 min</p>

                        <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-lg">
                            <div className="w-14 h-14 rounded-xl bg-[#D4537E] flex items-center justify-center">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-gray-900">Iniciar Treino</p>
                                <p className="text-sm text-gray-500">6 exercícios • 24 séries</p>
                            </div>
                            <svg className="w-6 h-6 text-gray-400 group-hover:text-[#D4537E] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
                <Link href="/student/chat" className="bg-white rounded-2xl p-5 shadow-md border border-pink-50 transition-all duration-300 hover:shadow-lg hover:border-pink-200">
                    <div className="w-12 h-12 rounded-xl bg-[#FBEAF0] flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-[#D4537E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <p className="font-semibold text-gray-900">Mensagens</p>
                    <p className="text-xs text-gray-500">Fale com sua coach</p>
                </Link>
                
                <Link href="/student/analytics" className="bg-white rounded-2xl p-5 shadow-md border border-pink-50 transition-all duration-300 hover:shadow-lg hover:border-pink-200">
                    <div className="w-12 h-12 rounded-xl bg-[#FBEAF0] flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-[#D4537E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <p className="font-semibold text-gray-900">Minha Evolução</p>
                    <p className="text-xs text-gray-500">Veja seu progresso</p>
                </Link>
            </div>

            {/* Upcoming Workouts */}
            <div>
                <h3 className="font-bold text-gray-900 mb-4">Próximos Treinos</h3>
                <div className="space-y-3">
                    {[
                        { name: 'B - Pull', day: 'Amanhã', color: 'bg-blue-100 text-blue-600' },
                        { name: 'C - Legs', day: 'Quarta', color: 'bg-green-100 text-green-600' },
                        { name: 'D - Full Body', day: 'Sexta', color: 'bg-purple-100 text-purple-600' },
                    ].map((workout, i) => (
                        <div key={i} className="bg-white p-4 rounded-2xl border border-pink-100 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${workout.color}`}>
                                    {workout.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{workout.name}</p>
                                    <p className="text-xs text-gray-500">{workout.day}</p>
                                </div>
                            </div>
                            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom spacing */}
            <div className="h-4" />
        </div>
    );
}