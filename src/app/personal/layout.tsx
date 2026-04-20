'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, LogOut, Dumbbell, Users, BarChart3, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PersonalLayoutProps {
    children: React.ReactNode;
    trainerName?: string;
}

const links = [
    { href: '/personal/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/personal/students', label: 'Alunas', icon: Users },
    { href: '/personal/library', label: 'Exercícios', icon: Dumbbell },
    { href: '/personal/chat', label: 'Mensagens', icon: MessageSquare },
];

export default function PersonalLayout({ children, trainerName = 'Personal' }: PersonalLayoutProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const initials = trainerName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {
            console.error('Logout error:', e);
        }
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-surface-alt">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-dark text-white border-b border-white/5">
                <div className="container mx-auto flex items-center h-16 gap-6 px-4 md:px-6">
                    <Link href="/personal/dashboard" className="flex items-center gap-2">
                        <div className="size-10 rounded-full bg-gradient-brand grid place-items-center ring-2 ring-primary-light">
                            <span className="font-display font-bold text-white">M&K</span>
                        </div>
                        <span className="font-display font-bold hidden sm:inline">M&K Fitness</span>
                    </Link>
                    
                    <nav className="hidden md:flex items-center gap-1 ml-4">
                        {links.map(l => {
                            const Icon = l.icon;
                            const isActive = pathname.startsWith(l.href);
                            return (
                                <Link key={l.href} href={l.href}
                                    className={cn(
                                        "px-4 h-10 flex items-center gap-2 rounded-lg text-sm font-semibold transition",
                                        isActive ? "bg-white/10 text-white" : "text-white/70 hover:text-white hover:bg-white/5"
                                    )}>
                                    <Icon size={16} />
                                    {l.label}
                                </Link>
                            );
                        })}
                    </nav>
                    
                    <div className="ml-auto relative">
                        <button onClick={() => setUserMenuOpen(o => !o)} className="flex items-center gap-2 hover:bg-white/5 rounded-xl pl-2 pr-3 h-11 transition">
                            <div className="size-9 rounded-full bg-gradient-brand grid place-items-center font-bold text-sm ring-2 ring-primary-light">{initials}</div>
                            <span className="hidden sm:flex flex-col items-start leading-tight">
                                <span className="text-sm font-semibold">{trainerName}</span>
                                <span className="text-[11px] text-white/60">Personal Trainer</span>
                            </span>
                            <ChevronDown size={16} className="text-white/60" />
                        </button>
                        
                        {userMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-card text-foreground shadow-pink-lg border border-border overflow-hidden">
                                <Link href="/personal/code" className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-primary-soft">
                                    <Users size={16} /> Meu Código
                                </Link>
                                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-primary-soft text-left">
                                    <LogOut size={16} /> Sair
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button 
                        onClick={() => setMobileMenuOpen(true)}
                        className="md:hidden p-2 hover:bg-white/5 rounded-lg"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Main content */}
            <main className="container mx-auto px-4 md:px-6 py-8">
                {children}
            </main>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div 
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border p-4 overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <div className="size-10 rounded-full bg-gradient-brand grid place-items-center">
                                    <span className="font-display font-bold text-white text-sm">M&K</span>
                                </div>
                                <span className="font-display font-bold">M&K Fitness</span>
                            </div>
                            <button 
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-muted-foreground p-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <nav className="space-y-1">
                            {links.map(l => {
                                const Icon = l.icon;
                                const isActive = pathname.startsWith(l.href);
                                return (
                                    <Link 
                                        key={l.href}
                                        href={l.href} 
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition",
                                            isActive ? "bg-gradient-brand text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                        )}>
                                        <Icon size={18} />
                                        {l.label}
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="mt-8 pt-4 border-t border-border">
                            <Link 
                                href="/personal/code" 
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-foreground"
                            >
                                <Users size={18} /> Meu Código
                            </Link>
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-foreground"
                            >
                                <LogOut size={18} /> Sair
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}