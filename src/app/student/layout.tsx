import Link from 'next/link';
import { TimerProvider } from './WorkoutTimerContext';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    return (
        <TimerProvider>
            <div className="flex flex-col h-screen w-full bg-gray-50">

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto pb-20">
                    {/* pb-20 ensures content isn't hidden behind the bottom nav */}
                    {children}
                </main>

                {/* Mobile Bottom Navigation */}
                <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-16 px-4 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
                    <Link href="/student/today" className="flex flex-col items-center justify-center w-full h-full text-blue-600">
                        <svg className="w-6 h-6 mb-1 outline-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[10px] font-medium">Hoje</span>
                    </Link>
                    <Link href="/student/history" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6 mb-1 outline-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className="text-[10px] font-medium">Histórico</span>
                    </Link>
                    <Link href="/student/profile" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6 mb-1 outline-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-[10px] font-medium">Perfil</span>
                    </Link>
                </nav>

            </div>
        </TimerProvider>
    );
}
