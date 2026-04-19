'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col lg:flex-row">
            {/* Left Side - Image Section */}
            <div className="relative w-full lg:w-[45%] h-[45vh] lg:h-screen overflow-hidden">
                <div className="absolute inset-0">
                    <img 
                        src="/essa.png" 
                        alt="M&K Fitness" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent lg:bg-gradient-to-r lg:from-[#0a0a0a]/80 lg:via-transparent" />
                </div>
                
                {/* Logo overlay */}
                <div className="absolute top-6 left-6 lg:top-10 lg:left-10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-[#D4537E]">
                            <img src="/logo-app.png" alt="M&K" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold text-lg tracking-tight">M&K</span>
                            <span className="text-[#D4537E] text-xs font-semibold tracking-widest uppercase">Fitness Center</span>
                        </div>
                    </div>
                </div>

                {/* Tagline for desktop */}
                <div className="absolute bottom-10 left-10 right-10 hidden lg:block">
                    <h2 className="text-white text-2xl font-bold leading-tight">
                        Seu espaço seguro<br/>para treinar e se cuidar.
                    </h2>
                    <p className="text-gray-400 mt-2 text-sm">Uma comunidade de mulher para mulher.</p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col justify-center px-6 py-10 lg:px-16 xl:px-24">
                <div className="w-full max-w-md mx-auto lg:mx-0">
                    {/* Mobile tagline */}
                    <div className="lg:hidden mb-8 text-center">
                        <h2 className="text-white text-xl font-bold">Seu espaço seguro para treinar</h2>
                    </div>

                    {/* Toggle */}
                    <div className="flex mb-8 bg-[#111111] p-1 rounded-2xl">
                        <button
                            type="button"
                            onClick={() => { setIsRegister(false); setError(''); }}
                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${!isRegister ? 'bg-[#D4537E] text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsRegister(true); setError(''); }}
                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${isRegister ? 'bg-[#D4537E] text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            Cadastrar
                        </button>
                    </div>

                    {error && (
                        <div className="bg-[#1a0f14] border border-[#4a1f2f] text-[#ff4d85] p-4 rounded-xl mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    {isRegister ? (
                        <form onSubmit={handleRegister} className="space-y-5">
                            <div>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-4 bg-[#111111] border border-[#222] rounded-xl text-white placeholder-gray-500 focus:border-[#D4537E] outline-none transition-colors"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nome completo"
                                />
                            </div>
                            <div>
                                <input
                                    type="email"
                                    required
                                    className="w-full p-4 bg-[#111111] border border-[#222] rounded-xl text-white placeholder-gray-500 focus:border-[#D4537E] outline-none transition-colors"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="E-mail"
                                />
                            </div>
                            <div>
                                <input
                                    type="tel"
                                    required
                                    className="w-full p-4 bg-[#111111] border border-[#222] rounded-xl text-white placeholder-gray-500 focus:border-[#D4537E] outline-none transition-colors"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="WhatsApp"
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-4 bg-[#111111] border border-[#222] rounded-xl text-white placeholder-gray-500 focus:border-[#D4537E] outline-none uppercase transition-colors"
                                    value={trainerCode}
                                    onChange={(e) => setTrainerCode(e.target.value)}
                                    placeholder="Código da personal"
                                />
                            </div>
                            <div>
                                <input
                                    type="password"
                                    required
                                    className="w-full p-4 bg-[#111111] border border-[#222] rounded-xl text-white placeholder-gray-500 focus:border-[#D4537E] outline-none transition-colors"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Senha"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 rounded-xl font-bold text-white transition-all ${loading ? 'opacity-50 cursor-not-allowed bg-[#333]' : 'bg-[#D4537E] hover:bg-[#b8466e]'}`}
                            >
                                {loading ? 'Cadastrando...' : 'Criar conta'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <input
                                    type="email"
                                    required
                                    className="w-full p-4 bg-[#111111] border border-[#222] rounded-xl text-white placeholder-gray-500 focus:border-[#D4537E] outline-none transition-colors"
                                    placeholder="E-mail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <input
                                    type="password"
                                    required
                                    className="w-full p-4 bg-[#111111] border border-[#222] rounded-xl text-white placeholder-gray-500 focus:border-[#D4537E] outline-none transition-colors"
                                    placeholder="Senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 rounded-xl font-bold text-white transition-all ${loading ? 'opacity-50 cursor-not-allowed bg-[#333]' : 'bg-[#D4537E] hover:bg-[#b8466e]'}`}
                            >
                                {loading ? 'Entrando...' : 'Entrar'}
                            </button>
                        </form>
                    )}
                    
                    <p className="text-center text-gray-600 text-xs mt-10">
                        © {new Date().getFullYear()} M&K Fitness Center
                    </p>
                </div>
            </div>
        </div>
    );
}