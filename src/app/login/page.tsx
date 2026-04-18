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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-pink-100">
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#D4537E] to-[#993556] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                        <span className="text-white text-2xl font-bold">M&K</span>
                    </div>
                    <h2 className="text-2xl font-bold text-[#1a1a1a]">
                        MeuTreino
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        {isRegister ? 'Crie sua conta' : 'Bem-vinda à M&K!'}
                    </p>
                    <p className="text-xs text-[#D4537E] font-medium mt-1">M&K Fitness Center</p>
                </div>

                <div className="flex rounded-full bg-pink-50 p-1">
                    <button
                        type="button"
                        onClick={() => { setIsRegister(false); setError(''); }}
                        className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                            !isRegister ? 'bg-[#D4537E] text-white shadow-md' : 'text-gray-500'
                        }`}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        onClick={() => { setIsRegister(true); setError(''); }}
                        className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                            isRegister ? 'bg-[#D4537E] text-white shadow-md' : 'text-gray-500'
                        }`}
                    >
                        Cadastrar
                    </button>
                </div>

                {isRegister ? (
                    <form className="mt-8 space-y-4" onSubmit={handleRegister}>
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
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4537E] focus:border-transparent transition-all"
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
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4537E] focus:border-transparent transition-all"
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
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4537E] focus:border-transparent transition-all"
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
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4537E] focus:border-transparent transition-all"
                                placeholder="Cole o código da sua coach"
                                value={trainerCode}
                                onChange={(e) => setTrainerCode(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-[#D4537E] to-[#993556] hover:from-[#993556] hover:to-[#D4537E] disabled:opacity-70 transition-all shadow-md"
                        >
                            {loading ? 'Criando conta...' : 'Criar minha conta'}
                        </button>
                    </form>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleLogin}>
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
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4537E] focus:border-transparent transition-all"
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
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4537E] focus:border-transparent transition-all"
                                placeholder="Sua senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-[#D4537E] to-[#993556] hover:from-[#993556] hover:to-[#D4537E] disabled:opacity-70 transition-all shadow-md"
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}