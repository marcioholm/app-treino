import Link from 'next/link';

export default function PersonalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen w-full bg-gray-50 flex-col md:flex-row">
            <nav className="w-full md:w-64 bg-white border-r border-pink-100 flex flex-col justify-between hidden md:flex">
                <div className="p-6">
                    <Link href="/personal/dashboard">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold tracking-tight">
                                <span className="text-[#1a1a1a]">M</span>
                                <span className="text-[#D4537E]">&</span>
                                <span className="text-[#1a1a1a]">K</span>
                                <span className="text-gray-500 text-lg font-normal ml-2">Admin</span>
                            </h1>
                            <p className="text-xs text-[#D4537E] font-medium mt-1">M&K Fitness Center</p>
                        </div>
                    </Link>
                    <div className="space-y-1">
                        <Link href="/personal/dashboard" className="block px-4 py-2.5 text-[#993556] bg-[#FBEAF0] rounded-lg font-medium">
                            Dashboard
                        </Link>
                        <Link href="/personal/students" className="block px-4 py-2.5 text-gray-700 rounded-lg hover:bg-[#FBEAF0] hover:text-[#D4537E] transition-colors">
                            Alunas
                        </Link>
                        <Link href="/personal/anamnesis" className="block px-4 py-2.5 text-gray-700 rounded-lg hover:bg-[#FBEAF0] hover:text-[#D4537E] transition-colors">
                            Anamnese
                        </Link>
                        <Link href="/personal/library" className="block px-4 py-2.5 text-gray-700 rounded-lg hover:bg-[#FBEAF0] hover:text-[#D4537E] transition-colors">
                            Biblioteca
                        </Link>
                        <Link href="/personal/chat" className="block px-4 py-2.5 text-gray-700 rounded-lg hover:bg-[#FBEAF0] hover:text-[#D4537E] transition-colors">
                            Mensagens
                        </Link>
                        <Link href="/personal/code" className="block px-4 py-2.5 text-gray-700 rounded-lg hover:bg-[#FBEAF0] hover:text-[#D4537E] transition-colors">
                            Meu Código
                        </Link>
                    </div>
                </div>
                <div className="p-4 border-t border-pink-100">
                    <Link href="/api/auth/logout" className="w-full text-left text-gray-500 hover:text-[#D4537E] px-4 py-2 rounded transition-colors flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sair
                    </Link>
                </div>
            </nav>

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="md:hidden bg-white border-b border-pink-100 p-4 flex items-center justify-between">
                    <Link href="/personal/dashboard">
                        <h1 className="text-xl font-bold tracking-tight">
                            <span className="text-[#1a1a1a]">M</span>
                            <span className="text-[#D4537E]">&</span>
                            <span className="text-[#1a1a1a]">K</span>
                        </h1>
                    </Link>
                    <button className="text-gray-600 p-2">
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