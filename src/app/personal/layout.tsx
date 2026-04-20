'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PersonalSidebar from '@/components/PersonalSidebar';

export default function PersonalLayout({ children }: { children: React.ReactNode }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const routes = [
        { name: 'Dashboard', path: '/personal/dashboard' },
        { name: 'Alunas', path: '/personal/students' },
        { name: 'Anamnese', path: '/personal/anamnesis' },
        { name: 'Biblioteca', path: '/personal/library' },
        { name: 'Mensagens', path: '/personal/chat' },
        { name: 'Meu Código', path: '/personal/code' },
    ];

    return (
        <div className="flex h-screen w-full bg-black flex-col md:flex-row">
            <div className="hidden md:block">
                <PersonalSidebar />
            </div>

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="md:hidden bg-[#111111] border-b border-[#333333] p-4 flex items-center justify-between">
                    <Link href="/personal/dashboard">
                        <h1 className="text-xl font-bold tracking-tight">
                            <span className="text-white">M</span>
                            <span className="text-[#D4537E]">&</span>
                            <span className="text-white">K</span>
                        </h1>
                    </Link>
                    <button 
                        onClick={() => setMobileMenuOpen(true)}
                        className="text-gray-400 p-2"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </header>

                <main className="flex-1 overflow-auto p-4 md:p-8">
                    {children}
                </main>
            </div>

            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div 
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="absolute left-0 top-0 bottom-0 w-64 bg-[#111111] border-r border-[#333333] p-4 overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-xl font-bold tracking-tight">
                                <span className="text-white">M</span>
                                <span className="text-[#D4537E]">&</span>
                                <span className="text-white">K</span>
                            </h1>
                            <button 
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-gray-400 p-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-1">
                            {routes.map((route) => {
                                const isActive = pathname === route.path;
                                return (
                                    <Link 
                                        key={route.path}
                                        href={route.path} 
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`block px-4 py-2.5 rounded-lg font-medium transition-colors ${isActive ? 'bg-[#D4537E]/10 text-[#D4537E]' : 'text-gray-300 hover:bg-[#D4537E]/5 hover:text-[#D4537E]'}`}
                                    >
                                        {route.name}
                                    </Link>
                                );
                            })}
                        </div>
                        <div className="mt-8 pt-4 border-t border-[#333333]">
                            <Link 
                                href="/api/auth/logout" 
                                onClick={() => setMobileMenuOpen(false)}
                                className="block text-gray-400 hover:text-[#D4537E] px-4 py-2 rounded transition-colors"
                            >
                                Sair
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}