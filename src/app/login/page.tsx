'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import GradientButton from '@/components/trainer/GradientButton';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function LoginForm() {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [trainerCode, setTrainerCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get('register') === 'true') {
            setIsRegister(true);
        }
    }, [searchParams]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Erro ao fazer login');
            }

            if (data.user.role === 'STUDENT') {
                router.push('/student/today');
            } else {
                router.push('/personal/dashboard');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register-student', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name, 
                    email, 
                    password,
                    phone,
                    trainerId: trainerCode 
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Erro ao cadastrar');
            }

            router.push('/student/today');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface">
                {/* Background gradient backgrounds */}
                <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-secondary/20 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(230_25%_4%)_80%)]" />
                
                <div className="relative z-10 flex flex-col justify-center items-center w-full p-16">
                    {/* Floating Branding Card */}
                    <div className="bg-glass-dark p-12 rounded-[2.5rem] border-white/5 shadow-pink-lg text-center backdrop-blur-3xl">
                        <div className="mb-10 flex justify-center">
                            <div className="size-24 rounded-[1.5rem] bg-gradient-brand grid place-items-center ring-4 ring-primary-light/20 shadow-pink">
                                <span className="font-display font-black text-white text-3xl">M&K</span>
                            </div>
                        </div>

                        <h1 className="font-display text-5xl font-black text-white mb-6 tracking-tight">
                            Treine com <span className="text-gradient-brand">Propósito</span>.
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-sm mx-auto mb-12 leading-relaxed">
                            A plataforma definitiva para personal trainers e atletas que buscam a excelência.
                        </p>

                        <div className="flex flex-col gap-5 text-left max-w-xs mx-auto">
                            {[
                                { title: 'Inteligência Artificial', desc: 'Treinos gerados sob medida.' },
                                { title: 'Gestão Inteligente', desc: 'Acompanhamento em tempo real.' }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="size-10 rounded-xl bg-primary/10 grid place-items-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                        <svg className="w-5 h-5 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-white font-bold text-sm tracking-tight">{item.title}</span>
                                        <span className="text-muted-foreground text-xs">{item.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-10">
                <div className="w-full max-w-md relative">
                    {/* Glow background behind form */}
                    <div className="absolute -inset-10 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex flex-col items-center mb-8">
                        <div className="size-14 rounded-xl bg-gradient-brand grid place-items-center ring-2 ring-primary-light mb-3">
                            <span className="font-display font-bold text-white">M&K</span>
                        </div>
                        <h1 className="font-display text-2xl font-bold">M&K Fitness</h1>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-10">
                        <h2 className="font-display text-4xl font-black text-white mb-3 tracking-tight">
                            {isRegister ? 'Criar conta' : 'Acesse o App'}
                        </h2>
                        <p className="text-muted-foreground font-medium">
                            {isRegister ? 'O seu corpo dos sonhos começa aqui.' : 'Entre para continuar evoluindo.'}
                        </p>
                    </div>

                    {/* Toggle */}
                    <div className="flex mb-10 bg-white/5 border border-white/10 p-1.5 rounded-2xl backdrop-blur-md">
                        <button
                            type="button"
                            onClick={() => { setIsRegister(false); setError(''); }}
                            className={cn(
                                "flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300",
                                !isRegister ? 'bg-gradient-brand text-white shadow-pink translate-y-0' : 'text-muted-foreground hover:text-white'
                            )}
                        >
                            Já sou aluna
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsRegister(true); setError(''); }}
                            className={cn(
                                "flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300",
                                isRegister ? 'bg-gradient-brand text-white shadow-pink translate-y-0' : 'text-muted-foreground hover:text-white'
                            )}
                        >
                            Quero treinar
                        </button>
                    </div>

                    {error && (
                        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-xl mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    {isRegister ? (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Nome completo</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3.5 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Seu nome completo"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">E-mail</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-3.5 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">WhatsApp</label>
                                <input
                                    type="tel"
                                    required
                                    className="w-full px-4 py-3.5 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="(11) 99999-9999"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Código da personal</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3.5 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase"
                                    value={trainerCode}
                                    onChange={(e) => setTrainerCode(e.target.value)}
                                    placeholder="MK123456"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Senha</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="w-full px-4 py-3.5 pr-12 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <GradientButton type="submit" className="w-full mt-2" size="lg" disabled={loading}>
                                {loading ? 'Criando conta...' : 'Criar conta'}
                            </GradientButton>
                            <p className="text-center text-xs text-muted-foreground mt-4">
                                Ao criar conta, você concorda com nossos termos de uso
                            </p>
                        </form>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">E-mail</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-3.5 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-foreground">Senha</label>
                                    <Link href="#" className="text-xs text-primary hover:text-primary-light">
                                        Esqueceu a senha?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="w-full px-4 py-3.5 pr-12 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <GradientButton type="submit" className="w-full mt-2" size="lg" disabled={loading}>
                                {loading ? 'Entrando...' : 'Entrar'}
                            </GradientButton>
                        </form>
                    )}
                    
                    <p className="text-center text-muted-foreground text-xs mt-10">
                        © {new Date().getFullYear()} M&K Fitness Center
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function Login() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}