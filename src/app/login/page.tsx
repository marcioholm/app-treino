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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-blue-600">
                        TrainerOS
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {isRegister ? 'Crie sua conta' : 'Entre na sua conta'}
                    </p>
                </div>

                {/* Toggle */}
                <div className="flex rounded-lg bg-gray-100 p-1">
                    <button
                        type="button"
                        onClick={() => { setIsRegister(false); setError(''); }}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                            !isRegister ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                        }`}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        onClick={() => { setIsRegister(true); setError(''); }}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                            isRegister ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
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
                                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Mínimo 6 caracteres"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Código do Personal</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Cole o código do seu personal"
                                value={trainerCode}
                                onChange={(e) => setTrainerCode(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 transition-colors"
                        >
                            {loading ? 'Criando conta...' : 'Criar conta'}
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
                                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Sua senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 transition-colors"
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}