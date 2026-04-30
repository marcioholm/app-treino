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
        include: { 
            user: true, 
            anamnesisAnswers: true,
            physicalAssessments: { orderBy: { date: 'desc' }, take: 1 }
        }
    });

    if (!student) {
        redirect('/login');
    }

    if (student.anamnesisAnswers.length === 0) {
        redirect('/student/anamnesis');
    }

    const hasAssessment = student.physicalAssessments.length > 0;

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

    // Find the latest published workout
    const activeWorkout = await prisma.workout.findFirst({
        where: { studentId: student.id, published: true },
        orderBy: { createdAt: 'desc' },
        include: {
            sessions: {
                orderBy: { order: 'asc' }
            }
        }
    });

    // Birthday Logic
    const allStudents = await prisma.student.findMany({
        where: { tenantId: student.tenantId },
        include: { user: true }
    });

    const today = new Date();
    const upcomingBirthdays = allStudents.filter(s => {
        if (!s.user.birthDate || s.id === student.id) return false;
        const bdate = new Date(s.user.birthDate);
        bdate.setFullYear(today.getFullYear());
        if (bdate < today && today.getDate() !== bdate.getDate()) {
            bdate.setFullYear(today.getFullYear() + 1);
        }
        const diffDays = Math.ceil((bdate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
    }).sort((a, b) => {
        const dA = new Date(a.user.birthDate!); dA.setFullYear(today.getFullYear());
        const dB = new Date(b.user.birthDate!); dB.setFullYear(today.getFullYear());
        if (dA < today) dA.setFullYear(today.getFullYear() + 1);
        if (dB < today) dB.setFullYear(today.getFullYear() + 1);
        return dA.getTime() - dB.getTime();
    });

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
                <h1 className="text-2xl font-bold text-white">
                    Olá, {student?.user?.name ? student.user.name.split(' ')[0] : 'atleta'}! 💪
                </h1>
                <p className="text-gray-400 mt-1 text-sm">Vamos arrasar no treino hoje?</p>
            </header>

            {/* Manifesto Banner */}
            <ManifestoBanner />

            {/* Check-in Reminder */}
            {needsCheckIn && (
                <Link 
                    href="/student/checkin" 
                    className="block bg-[#111111] border border-[#333333] rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#D4537E]/10 flex items-center justify-center">
                            <svg className="w-7 h-7 text-[#D4537E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white">Check-in Semanal</h3>
                            <p className="text-sm text-gray-400">Como você está se sentindo?</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#D4537E] flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </Link>
            )}

            {/* Missão do Dia: Aniversários */}
            {upcomingBirthdays.length > 0 && (
                <div className="bg-gradient-to-r from-[#200A12] to-[#111111] border border-[#D4537E]/30 rounded-3xl p-5 relative overflow-hidden shadow-xl mb-6">
                    <div className="absolute right-0 top-0 opacity-10 text-9xl">🎈</div>
                    <div className="relative z-10 space-y-1 mb-4">
                        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                            <span className="text-[#D4537E]">Missão do Dia</span> 🎂
                        </h2>
                        <p className="text-sm text-gray-300">Hoje é um dia especial na comunidade! Encontre quem está celebrando vida e dê os parabéns.</p>
                    </div>
                    
                    <div className="relative z-10 flex flex-col gap-2">
                        {upcomingBirthdays.map(b => {
                            const bDate = new Date(b.user.birthDate!);
                            const isToday = bDate.getDate() === today.getDate() && bDate.getMonth() === today.getMonth();
                            return (
                                <div key={b.id} className="bg-black/40 p-3 rounded-2xl flex items-center justify-between border border-[#333333]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#D4537E]/20 flex items-center justify-center font-bold text-[#D4537E]">
                                            {b.user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">{b.user.name}</p>
                                            <p className="text-xs text-[#D4537E] font-medium">{isToday ? "Faz aniversário hoje!" : `Celebra dia ${bDate.getDate()}/${bDate.getMonth()+1}`}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Today's Workout Card or Assessment Blocker */}
            {!hasAssessment ? (
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#D4537E]/20 bg-[#111111] p-8 text-center space-y-6">
                    <div className="w-20 h-20 bg-[#D4537E]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-10 h-10 text-[#D4537E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">Avaliação Pendente</h2>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Para receber seu treino personalizado e seguro, precisamos completar sua <span className="text-white font-bold">Avaliação Física</span> primeiro.
                        </p>
                    </div>
                    <Link 
                        href="/student/chat"
                        className="block w-full py-4 bg-[#D4537E] text-white rounded-2xl font-bold shadow-lg shadow-[#D4537E]/20 active:scale-95 transition-all"
                    >
                        Falar com Treinador
                    </Link>
                </div>
            ) : activeWorkout ? (
                <Link href="/student/workout/today" className="block group">
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 group-hover:scale-[1.02]">
                        {/* Background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#D4537E] via-[#993556] to-[#72243E]" />
                        
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-[#111111] opacity-10 rounded-full -mr-16 -mt-16" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#111111] opacity-10 rounded-full -ml-10 -mb-10" />
                        <div className="absolute top-1/2 right-8 w-24 h-24 border border-white/10 rounded-full" />
                        
                        <div className="relative z-10 p-6 pt-8">
                            <span className="inline-block px-4 py-1.5 bg-[#111111]/20 rounded-full text-xs font-semibold tracking-wide uppercase mb-4 backdrop-blur-sm">
                                Treino Ativo
                            </span>

                            <h2 className="text-3xl font-bold text-white mb-2">{activeWorkout.name}</h2>
                            <p className="text-pink-100 text-base mb-6">Personalizado para seus objetivos</p>

                            <div className="bg-[#111111] rounded-2xl p-4 flex items-center gap-4 shadow-lg">
                                <div className="w-14 h-14 rounded-xl bg-[#D4537E] flex items-center justify-center">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-white">Iniciar Treino</p>
                                    <p className="text-sm text-gray-400">Ver exercícios disponíveis</p>
                                </div>
                                <svg className="w-6 h-6 text-gray-400 group-hover:text-[#D4537E] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </Link>
            ) : (
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#333333] bg-[#111111] p-8 text-center space-y-6">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">Treino em Montagem</h2>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Sua coach está preparando um planejamento exclusivo para você. Em breve ele aparecerá aqui!
                        </p>
                    </div>
                    <Link 
                        href="/student/chat"
                        className="block w-full py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all"
                    >
                        Falar com Treinador
                    </Link>
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
                <Link href="/student/chat" className="bg-[#111111] rounded-2xl p-5 shadow-md border border-[#333333] transition-all duration-300 hover:border-[#D4537E]/30">
                    <div className="w-12 h-12 rounded-xl bg-[#D4537E]/10 flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-[#D4537E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <p className="font-semibold text-white">Mensagens</p>
                    <p className="text-xs text-gray-400">Fale com sua coach</p>
                </Link>
                
                <Link href="/student/profile" className="bg-[#111111] rounded-2xl p-5 shadow-md border border-[#333333] transition-all duration-300 hover:border-[#D4537E]/30">
                    <div className="w-12 h-12 rounded-xl bg-[#D4537E]/10 flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-[#D4537E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <p className="font-semibold text-white">Meu Perfil</p>
                    <p className="text-xs text-gray-400">Suas informações</p>
                </Link>
            </div>

            {/* Upcoming Sessions (only if workout exists) */}
            {activeWorkout && activeWorkout.sessions.length > 1 && (
                <div>
                    <h3 className="font-bold text-white mb-4 uppercase text-[10px] tracking-widest opacity-60">Próximas Sessões</h3>
                    <div className="space-y-3">
                        {activeWorkout.sessions.slice(1).map((session: any, i: number) => (
                            <div key={session.id} className="bg-[#111111] p-4 rounded-2xl border border-[#333333] flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center font-bold text-lg text-white">
                                        {session.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">{session.name}</p>
                                        <p className="text-xs text-gray-400">Próxima aula</p>
                                    </div>
                                </div>
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bottom spacing */}
            <div className="h-4" />
        </div>
    );
}