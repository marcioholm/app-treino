'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [trainerCode, setTrainerCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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
        <div className="min-h-screen bg-[#1a1a1a] relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] rounded-full bg-[#D4537E] opacity-[0.08]" />
                <div className="absolute -bottom-1/2 -left-1/4 w-[500px] h-[500px] rounded-full bg-[#D4537E] opacity-[0.06]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-[#D4537E] opacity-[0.03]" />
            </div>

            <div className="min-h-screen flex items-center justify-center py-12 px-4 relative z-10">
                <div className="max-w-md w-full space-y-8">
                    {/* Logo and branding */}
                    <div className="text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#D4537E] to-[#993556] flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold">M&K</span>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-4xl font-extrabold text-white tracking-tight">
                                M<span className="text-[#D4537E]">&</span>K
                            </h1>
                            <p className="text-[#D4537E] font-semibold text-sm tracking-widest uppercase mt-2">
                                Fitness Center
                            </p>
                        </div>
                        <p className="text-gray-400 text-sm">Seu espaço de transformação</p>
                    </div>

                    {/* Main card */}
                    <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 space-y-6 shadow-2xl border border-white/10">
                        {/* Toggle */}
                        <div className="flex rounded-2xl bg-[#f9f5f7] p-1.5">
                            <button
                                type="button"
                                onClick={() => { setIsRegister(false); setError(''); }}
                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                    !isRegister 
                                        ? 'bg-white text-[#D4537E] shadow-lg' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Login
                            </button>
                            <button
                                type="button"
                                onClick={() => { setIsRegister(true); setError(''); }}
                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                    isRegister 
                                        ? 'bg-white text-[#D4537E] shadow-lg' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Cadastrar
                            </button>
                        </div>

                        {isRegister ? (
                            <form className="space-y-5" onSubmit={handleRegister}>
                                {error && (
                                    <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm text-center">
                                        {error}
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">Nome completo</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:outline-none focus:border-[#D4537E] focus:bg-white transition-all duration-300"
                                        placeholder="Como devemos te chamar?"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">E-mail</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:outline-none focus:border-[#D4537E] focus:bg-white transition-all duration-300"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">Senha</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        className="w-full px-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:outline-none focus:border-[#D4537E] focus:bg-white transition-all duration-300"
                                        placeholder="Mínimo 6 caracteres"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">WhatsApp (opcional)</label>
                                    <input
                                        type="tel"
                                        className="w-full px-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:outline-none focus:border-[#D4537E] focus:bg-white transition-all duration-300"
                                        placeholder="(00) 00000-0000"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">Código da Coach</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:outline-none focus:border-[#D4537E] focus:bg-white transition-all duration-300"
                                        placeholder="Cole o código da sua coach"
                                        value={trainerCode}
                                        onChange={(e) => setTrainerCode(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-[#D4537E] to-[#993556] hover:opacity-90 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Criando conta...
                                        </span>
                                    ) : 'Criar minha conta'}
                                </button>
                            </form>
                        ) : (
                            <form className="space-y-5" onSubmit={handleLogin}>
                                {error && (
                                    <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm text-center">
                                        {error}
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">E-mail</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:outline-none focus:border-[#D4537E] focus:bg-white transition-all duration-300"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">Senha</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full px-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:outline-none focus:border-[#D4537E] focus:bg-white transition-all duration-300"
                                        placeholder="Sua senha"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-[#D4537E] to-[#993556] hover:opacity-90 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Entrando...
                                        </span>
                                    ) : 'Entrar'}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Footer */}
                    <p className="text-center text-gray-500 text-xs">
                        Academia exclusiva para mulheres · Arapoti/PR
                    </p>
                </div>
            </div>
        </div>
    );
}