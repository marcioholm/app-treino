'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
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
        <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] py-12 px-4">
            <div className="max-w-md w-full space-y-6">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">
                        M<span className="text-[#D4537E]">&</span>K
                    </h1>
                    <p className="text-[#D4537E] font-semibold text-sm tracking-widest uppercase mt-1">
                        Fitness Center
                    </p>
                    <p className="text-gray-400 text-xs mt-2">MeuTreino App</p>
                </div>

                <div className="bg-white rounded-2xl p-8 space-y-5 shadow-xl">
                    <div className="flex rounded-lg bg-gray-100 p-1">
                        <button
                            type="button"
                            onClick={() => { setIsRegister(false); setError(''); }}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                !isRegister ? 'bg-white text-[#D4537E] shadow-sm font-semibold' : 'text-gray-500'
                            }`}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsRegister(true); setError(''); }}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                isRegister ? 'bg-white text-[#D4537E] shadow-sm font-semibold' : 'text-gray-500'
                            }`}
                        >
                            Cadastrar
                        </button>
                    </div>

                    {isRegister ? (
                        <form className="space-y-4" onSubmit={handleRegister}>
                            {error && (
                                <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">
                                    {error}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4537E] focus:border-[#D4537E]"
                                    placeholder="Seu nome"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4537E] focus:border-[#D4537E]"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4537E] focus:border-[#D4537E]"
                                    placeholder="Mínimo 6 caracteres"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Código da Coach</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4537E] focus:border-[#D4537E]"
                                    placeholder="Cole o código da sua coach"
                                    value={trainerCode}
                                    onChange={(e) => setTrainerCode(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#D4537E] hover:bg-[#993556] disabled:opacity-70 transition-colors"
                            >
                                {loading ? 'Criando conta...' : 'Criar minha conta'}
                            </button>
                        </form>
                    ) : (
                        <form className="space-y-5" onSubmit={handleLogin}>
                            {error && (
                                <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">
                                    {error}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4537E] focus:border-[#D4537E]"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4537E] focus:border-[#D4537E]"
                                    placeholder="Sua senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#D4537E] hover:bg-[#993556] disabled:opacity-70 transition-colors"
                            >
                                {loading ? 'Entrando...' : 'Entrar'}
                            </button>
                        </form>
                    )}
                </div>

                <p className="text-center text-gray-500 text-xs">
                    Academia exclusiva para mulheres · Arapoti/PR
                </p>
            </div>
        </div>
    );
}