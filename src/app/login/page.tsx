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
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-dark">
                    {/* Background gradient circles */}
                    <div className="absolute top-0 -left-20 w-[400px] h-[400px] bg-primary/30 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-secondary/30 rounded-full blur-[150px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px]" />
                </div>
                
                <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
                    {/* Logo */}
                    <div className="mb-8">
                        <div className="size-20 rounded-2xl bg-gradient-brand grid place-items-center ring-4 ring-primary-light/30 shadow-pink-lg">
                            <span className="font-display font-bold text-white text-2xl">M&K</span>
                        </div>
                    </div>

                    <h1 className="font-display text-4xl font-bold text-white text-center mb-4">
                        M&K Fitness
                    </h1>
                    <p className="text-white/70 text-lg text-center max-w-md mb-12">
                        Seu espaço seguro para treinar e se cuidar. Uma comunidade de mulher para mulher.
                    </p>

                    {/* Benefits */}
                    <div className="space-y-4">
                        {[
                            'Treinos personalizados com IA',
                            'Acompanhamento profissional',
                            'Comunidade feminina'
                        ].map((benefit, i) => (
                            <div key={i} className="flex items-center gap-3 text-white/80">
                                <div className="size-6 rounded-full bg-primary/20 grid place-items-center">
                                    <svg className="w-4 h-4 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span>{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-10 bg-surface-alt">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex flex-col items-center mb-8">
                        <div className="size-14 rounded-xl bg-gradient-brand grid place-items-center ring-2 ring-primary-light mb-3">
                            <span className="font-display font-bold text-white">M&K</span>
                        </div>
                        <h1 className="font-display text-2xl font-bold">M&K Fitness</h1>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                            {isRegister ? 'Criar conta' : 'Bem-vinda de volta'}
                        </h2>
                        <p className="text-muted-foreground">
                            {isRegister ? 'Preencha seus dados para começar' : 'Entre com sua conta para continuar'}
                        </p>
                    </div>

                    {/* Toggle */}
                    <div className="flex mb-8 bg-card border border-border p-1 rounded-2xl">
                        <button
                            type="button"
                            onClick={() => { setIsRegister(false); setError(''); }}
                            className={cn(
                                "flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all",
                                !isRegister ? 'bg-gradient-brand text-primary-foreground shadow-pink' : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsRegister(true); setError(''); }}
                            className={cn(
                                "flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all",
                                isRegister ? 'bg-gradient-brand text-primary-foreground shadow-pink' : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            Cadastrar
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