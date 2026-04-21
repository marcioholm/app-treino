'use client';
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LogOut, Dumbbell, Users, BarChart3 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const links = [
  { href: "/personal/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/personal/students", label: "Alunas", icon: Users },
  { href: "/personal/library", label: "Exercícios", icon: Dumbbell },
  { href: "/personal/chat", label: "Mensagens", icon: Users },
];

interface TrainerHeaderProps {
  trainerName?: string;
}

export default function TrainerHeader({ trainerName = "Personal" }: TrainerHeaderProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const initials = trainerName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    router.push('/');
  };

  return (
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
          <button onClick={() => setOpen(o => !o)} className="flex items-center gap-2 hover:bg-white/5 rounded-xl pl-2 pr-3 h-11 transition">
            <div className="size-9 rounded-full bg-gradient-brand grid place-items-center font-bold text-sm ring-2 ring-primary-light">{initials}</div>
            <span className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-sm font-semibold">{trainerName}</span>
              <span className="text-[11px] text-white/60">Personal Trainer</span>
            </span>
            <ChevronDown size={16} className="text-white/60" />
          </button>
          
          {open && (
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
      </div>
    </header>
  );
}