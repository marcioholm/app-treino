import Link from 'next/link';

export default function PersonalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen w-full bg-gray-50 flex-col md:flex-row">
            {/* Sidebar Desktop / Navbar Mobile */}
            <nav className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col justify-between hidden md:flex">
                <div className="p-6">
                    <Link href="/personal/dashboard">
                        <h1 className="text-2xl font-bold text-blue-600 tracking-tight">TrainerOS</h1>
                    </Link>
                    <div className="mt-8 space-y-2">
                        <Link href="/personal/dashboard" className="block px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                            Dashboard
                        </Link>
                        <Link href="/personal/students" className="block px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                            Alunos
                        </Link>
                        <Link href="/personal/anamnesis" className="block px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                            Anamnese
                        </Link>
                        <Link href="/personal/library" className="block px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                            Biblioteca
                        </Link>
                    </div>
                </div>
                <div className="p-6 border-t border-gray-200">
                    <button className="w-full text-left text-gray-600 hover:text-gray-900 px-4 py-2 rounded transition-colors" suppressHydrationWarning>Sair</button>
                </div>
            </nav>

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                    <Link href="/personal/dashboard">
                        <h1 className="text-xl font-bold text-blue-600">TrainerOS</h1>
                    </Link>
                    <button className="text-gray-600 p-2">Menu</button>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
