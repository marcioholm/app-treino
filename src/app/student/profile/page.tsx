'use client';
import Link from 'next/link';
import { History, Calendar, UserRound, LogOut, Settings, Award } from 'lucide-react';

export default function ProfilePage() {
    return (
        <div className="flex flex-col h-screen bg-gray-50 pb-20">
            <header className="bg-white px-6 py-5 border-b border-gray-100 shadow-sm sticky top-0 z-10 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Perfil</h1>
                <button className="text-gray-400 hover:text-gray-600"><Settings className="w-6 h-6" /></button>
            </header>

            <main className="flex-1 p-4 lg:p-6 overflow-auto max-w-md mx-auto w-full space-y-6">

                {/* Profile Header */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4">
                        AT
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Aluno Teste</h2>
                    <p className="text-gray-500 text-sm">aluno@traineros.com</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                        <Award className="w-8 h-8 text-yellow-500 mb-2" />
                        <span className="text-2xl font-bold text-gray-900">12</span>
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Treinos Feitos</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-blue-600 mb-1">↑ 2.5kg</span>
                        <span className="block text-xl font-bold text-gray-900">75 kg</span>
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Peso Atual</span>
                    </div>
                </div>

                {/* Logout */}
                <div className="pt-6">
                    <Link href="/api/auth/logout" className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-4 rounded-xl font-bold hover:bg-red-100 transition-colors">
                        <LogOut className="w-5 h-5" />
                        Sair da Conta
                    </Link>
                </div>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center pb-safe-bottom z-50 md:hidden">
                <Link href="/student/today" className="flex flex-col items-center gap-1 text-gray-500">
                    <Calendar className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Hoje</span>
                </Link>
                <Link href="/student/history" className="flex flex-col items-center gap-1 text-gray-500">
                    <History className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Histórico</span>
                </Link>
                <Link href="/student/profile" className="flex flex-col items-center gap-1 text-blue-600">
                    <UserRound className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Perfil</span>
                </Link>
            </nav>
        </div>
    );
}
