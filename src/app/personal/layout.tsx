'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, LogOut, Dumbbell, Users, BarChart3, MessageSquare, Menu, X } from 'lucide-react';
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
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
            {/* Header / Sidebar for desktop would be nice, but sticking to header for now with premium polish */}
            <header className="sticky top-0 z-40 bg-background/50 backdrop-blur-xl border-b border-white/5">
                <div className="container mx-auto flex items-center h-20 gap-8 px-4 md:px-6">
                    <Link href="/personal/dashboard" className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95">
                        <div className="size-11 rounded-2xl bg-gradient-brand grid place-items-center shadow-pink ring-1 ring-white/10">
                            <span className="font-display font-black text-white text-lg tracking-tighter">M&K</span>
                        </div>
                        <div className="hidden sm:flex flex-col leading-none">
                            <span className="font-display font-black text-white tracking-tight">Fitness Center</span>
                            <span className="text-[10px] font-bold text-primary-light uppercase tracking-widest mt-0.5">Trainer OS</span>
                        </div>
                    </Link>
                    
                    <nav className="hidden md:flex items-center gap-1.5 ml-4">
                        {links.map(l => {
                            const Icon = l.icon;
                            const isActive = pathname.startsWith(l.href);
                            return (
                                <Link key={l.href} href={l.href}
                                    className={cn(
                                        "px-5 h-11 flex items-center gap-2.5 rounded-2xl text-sm font-bold transition-all duration-300",
                                        isActive 
                                            ? "bg-white/5 text-primary-light shadow-sm ring-1 ring-white/5" 
                                            : "text-muted-foreground hover:text-white hover:bg-white/[0.03]"
                                    )}>
                                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                    {l.label}
                                </Link>
                            );
                        })}
                    </nav>
                    
                    <div className="ml-auto flex items-center gap-4">
                        <div className="hidden sm:block h-8 w-px bg-white/5 mx-2" />
                        
                        <div className="relative">
                            <button 
                                onClick={() => setUserMenuOpen(o => !o)} 
                                className="flex items-center gap-3 hover:bg-white/5 rounded-2xl p-1.5 transition-all outline-none"
                            >
                                <div className="size-10 rounded-xl bg-glass border border-white/10 flex items-center justify-center font-display font-black text-sm text-primary-light transition-transform hover:rotate-3">
                                    {initials}
                                </div>
                                <div className="hidden lg:flex flex-col items-start leading-none gap-1">
                                    <span className="text-sm font-bold text-white pr-2">{trainerName}</span>
                                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Master Coach</span>
                                </div>
                                <ChevronDown size={14} className={cn("text-muted-foreground transition-transform duration-300", userMenuOpen && "rotate-180")} />
                            </button>
                            
                            {userMenuOpen && (
                                <div className="absolute right-0 mt-3 w-56 rounded-[1.5rem] bg-glass-dark border border-white/10 shadow-2xl py-2 animate-fade-in overflow-hidden backdrop-blur-3xl">
                                    <Link href="/personal/code" className="flex items-center gap-3 px-5 py-3.5 text-sm font-bold text-white hover:bg-white/5 transition-colors">
                                        <Users size={18} className="text-primary-light" /> 
                                        <span>Meu Código</span>
                                    </Link>
                                    <div className="h-px bg-white/5 mx-4 my-1" />
                                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors text-left">
                                        <LogOut size={18} /> 
                                        <span>Sair do OS</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <button 
                            onClick={() => setMobileMenuOpen(true)}
                            className="md:hidden size-11 rounded-2xl bg-white/5 grid place-items-center text-white border border-white/5 transition-all active:scale-95"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="container mx-auto px-4 md:px-6 py-10 relative overflow-hidden">
                {/* Background Decor */}
                <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
                <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none -z-10" />
                
                {children}
            </main>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden bg-background/95 backdrop-blur-xl animate-fade-in">
                    <div className="flex flex-col h-full p-8">
                        <div className="flex items-center justify-between mb-12">
                            <div className="flex items-center gap-3">
                                <div className="size-11 rounded-2xl bg-gradient-brand grid place-items-center">
                                    <span className="font-display font-black text-white text-lg">M&K</span>
                                </div>
                                <span className="font-display font-black text-white text-xl">Fitness OS</span>
                            </div>
                            <button 
                                onClick={() => setMobileMenuOpen(false)}
                                className="size-11 rounded-2xl bg-white/5 grid place-items-center text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <nav className="flex flex-col gap-4">
                            {links.map(l => {
                                const Icon = l.icon;
                                const isActive = pathname.startsWith(l.href);
                                return (
                                    <Link 
                                        key={l.href}
                                        href={l.href} 
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-4 px-6 py-5 rounded-[2rem] text-lg font-black transition-all",
                                            isActive 
                                                ? "bg-gradient-brand text-white shadow-pink-lg" 
                                                : "bg-white/5 text-muted-foreground active:scale-95"
                                        )}>
                                        <Icon size={22} strokeWidth={2.5} />
                                        {l.label}
                                    </Link>
                                );
                            })}
                        </nav>
                        
                        <div className="mt-auto pt-8 flex flex-col gap-4">
                            <button onClick={handleLogout} className="flex items-center justify-center gap-3 w-full py-5 rounded-[2rem] bg-red-500/10 text-red-400 font-black text-lg">
                                <LogOut size={22} /> Sair do Treinador OS
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}