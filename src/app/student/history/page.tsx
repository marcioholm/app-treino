import Link from 'next/link';
import { History, Calendar, UserRound } from 'lucide-react';

export default function HistoryPage() {
    return (
        <div className="flex flex-col h-screen bg-gray-50 pb-20">
            <header className="bg-white px-6 py-5 border-b border-gray-100 flex justify-between items-center shadow-sm sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Histórico</h1>
            </header>

            <main className="flex-1 p-4 lg:p-6 overflow-auto max-w-md mx-auto w-full">
                <div className="space-y-4">

                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm opacity-60">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-gray-900">Treino A - Push</h3>
                            <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md">Concluído</span>
                        </div>
                        <p className="text-gray-500 text-sm mb-3">Ontem • 45 min</p>
                        <div className="text-sm text-gray-600 font-medium">18.500 kg volume total</div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm opacity-60">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-gray-900">Treino C - Pull</h3>
                            <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md">Concluído</span>
                        </div>
                        <p className="text-gray-500 text-sm mb-3">Quinta-feira • 52 min</p>
                        <div className="text-sm text-gray-600 font-medium">21.200 kg volume total</div>
                    </div>

                </div>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center pb-safe-bottom z-50 md:hidden">
                <Link href="/student/today" className="flex flex-col items-center gap-1 text-gray-500">
                    <Calendar className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Hoje</span>
                </Link>
                <Link href="/student/history" className="flex flex-col items-center gap-1 text-blue-600">
                    <History className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Histórico</span>
                </Link>
                <Link href="/student/profile" className="flex flex-col items-center gap-1 text-gray-500">
                    <UserRound className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Perfil</span>
                </Link>
            </nav>
        </div>
    );
}
