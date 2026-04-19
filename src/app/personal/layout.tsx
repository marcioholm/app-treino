import Link from 'next/link';
import PersonalSidebar from '@/components/PersonalSidebar';

export default function PersonalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen w-full bg-black flex-col md:flex-row">
            <PersonalSidebar />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="md:hidden bg-[#111111] border-b border-[#333333] p-4 flex items-center justify-between">
                    <Link href="/personal/dashboard">
                        <h1 className="text-xl font-bold tracking-tight">
                            <span className="text-white">M</span>
                            <span className="text-[#D4537E]">&</span>
                            <span className="text-white">K</span>
                        </h1>
                    </Link>
                    <button className="text-gray-400 p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </header>

                <main className="flex-1 overflow-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}