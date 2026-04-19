'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PersonalSidebar() {
    const pathname = usePathname();
    const [unreadChat, setUnreadChat] = useState<number>(0);

    const fetchUnread = async () => {
        try {
            const res = await fetch('/api/chat/unread');
            if (res.ok) {
                const data = await res.json();
                setUnreadChat(data.count);
            }
        } catch(e) {}
    }

    useEffect(() => {
        fetchUnread();
        const interval = setInterval(fetchUnread, 5000);
        return () => clearInterval(interval);
    }, []);

    const routes = [
        { name: 'Dashboard', path: '/personal/dashboard' },
        { name: 'Alunas', path: '/personal/students' },
        { name: 'Anamnese', path: '/personal/anamnesis' },
        { name: 'Biblioteca', path: '/personal/library' },
        { name: 'Mensagens', path: '/personal/chat', badge: unreadChat > 0 ? unreadChat : null },
        { name: 'Meu Código', path: '/personal/code' },
    ];

    return (
        <nav className="w-full md:w-64 bg-[#111111] border-r border-[#333333] flex-col justify-between hidden md:flex">
            <div className="p-6">
                <Link href="/personal/dashboard">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold tracking-tight">
                            <span className="text-white">M</span>
                            <span className="text-[#D4537E]">&</span>
                            <span className="text-white">K</span>
                            <span className="text-gray-400 text-lg font-normal ml-2">Admin</span>
                        </h1>
                        <p className="text-xs text-[#D4537E] font-medium mt-1">M&K Fitness Center</p>
                    </div>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => {
                        const isActive = pathname === route.path;
                        return (
                            <Link 
                                key={route.path}
                                href={route.path} 
                                className={`flex items-center justify-between px-4 py-2.5 rounded-lg font-medium transition-colors ${isActive ? 'bg-[#D4537E]/10 text-[#D4537E]' : 'text-gray-300 hover:bg-[#D4537E]/5 hover:text-[#D4537E]'}`}
                            >
                                <span>{route.name}</span>
                                {route.badge && (
                                    <span className="bg-[#D4537E] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                        {route.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
            <div className="p-4 border-t border-[#333333]">
                <Link href="/api/auth/logout" className="w-full text-left text-gray-400 hover:text-[#D4537E] px-4 py-2 rounded transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sair
                </Link>
            </div>
        </nav>
    );
}
