'use client';
import { useState } from 'react';
import { useEffect } from 'react';

interface BottomNavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

const navItems: BottomNavItem[] = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Hoje',
    href: '/student/today',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    label: 'Evolução',
    href: '/student/analytics',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    label: 'Mensagens',
    href: '/student/chat',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    label: 'Perfil',
    href: '/student/profile',
  },
];

function BottomNav() {
  const [mounted, setMounted] = useState(false);
  const [activePath, setActivePath] = useState('/student/today');

  useEffect(() => {
    setMounted(true);
    setActivePath(window.location.pathname);
  }, []);

  if (!mounted) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-pink-100 flex justify-around items-center h-20 px-2 z-50 shadow-[0_-8px_30px_rgba(212,83,126,0.15)]">
      {navItems.map((item) => {
        const isActive = activePath === item.href || activePath.startsWith(item.href + '/');
        return (
          <a
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-full py-2 transition-all duration-300 relative ${
              isActive ? 'text-[#D4537E]' : 'text-gray-400 hover:text-[#D4537E]'
            }`}
          >
            <div className={`transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
              {item.icon}
            </div>
            <span className={`text-[10px] font-medium mt-1 ${isActive ? 'text-[#D4537E]' : ''}`}>
              {item.label}
            </span>
            {isActive && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#D4537E] rounded-full" />
            )}
          </a>
        );
      })}
    </nav>
  );
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-full bg-[#fafafa]">
      <main className="flex-1 overflow-auto pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}