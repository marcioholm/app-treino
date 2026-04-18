import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';
import MKLogo from '@/components/MKLogo';
import { redirect } from 'next/navigation';

export default async function TrainerCode() {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('mk_app_token')?.value;
    const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

    if (!payload || (payload.role !== 'TRAINER' && payload.role !== 'OWNER_PERSONAL')) {
        redirect('/login');
    }

    const trainer = await prisma.user.findUnique({
        where: { id: payload.userId },
    });

    const studentCode = trainer?.studentCode || trainer?.id.slice(0, 8).toUpperCase();

    if (!trainer?.studentCode && trainer) {
        await prisma.user.update({
            where: { id: trainer.id },
            data: { studentCode },
        });
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(studentCode || '');
    };

    return (
        <div className="p-8 max-w-md mx-auto space-y-8">
            <div className="text-center">
                <MKLogo size="xl" className="mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900">Código da Coach</h1>
                <p className="text-gray-500 mt-2">Compartilhe este código com suas alunas</p>
            </div>

            <div className="bg-gradient-to-br from-[#D4537E] to-[#993556] rounded-3xl p-8 text-center shadow-2xl">
                <p className="text-pink-100 text-sm mb-2">Seu código único</p>
                <p className="text-4xl font-extrabold text-white tracking-widest">{studentCode}</p>
                <p className="text-pink-200 text-xs mt-4">M&K Fitness Center</p>
            </div>

            <button
                onClick={copyToClipboard}
                className="w-full py-4 px-6 bg-[#D4537E] hover:bg-[#993556] text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copiar código
            </button>

            <div className="bg-[#FBEAF0] rounded-2xl p-5 border border-[#F4C0D1]">
                <p className="text-sm text-[#72243E]">
                    <strong>Como funciona:</strong> Suas alunas devem inserir este código ao se cadastrarem no app. Isso as vincula automaticamente à sua conta.
                </p>
            </div>
        </div>
    );
}