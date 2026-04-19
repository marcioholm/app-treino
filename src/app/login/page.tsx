'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ManifestoBanner from '@/components/ManifestoBanner';
import MKLogo from '@/components/MKLogo';

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
        <div className="min-h-screen bg-black flex flex-col md:flex-row w-full font-sans">
            {/* Desktop Left Side: Manifesto Banner */}
            <div className="hidden md:flex md:w-1/2 lg:w-[60%]">
                <ManifestoBanner />
            </div>

            {/* Right Side / Mobile Full: Form View */}
            <div className="w-full md:w-1/2 lg:w-[40%] min-h-screen flex flex-col justify-center px-6 py-12 md:px-12 xl:px-20 relative">
                <div className="absolute top-6 left-6 md:hidden">
                    <MKLogo size="sm" variant="icon" />
                </div>
                
                <div className="w-full max-w-[400px] mx-auto">
                    <div className="text-center md:text-left mb-10">
                        <div className="hidden md:block mb-8">
                            <MKLogo size="md" variant="icon" />
                        </div>
                        <h1 className="text-white text-3xl font-black mb-2 tracking-tight">
                            {isRegister ? 'Crie sua conta' : 'Bem-vinda de volta'}
                        </h1>
                        <p className="text-gray-400 font-medium">
                            {isRegister ? 'Preencha seus dados para começar.' : 'Faça login para acessar seus treinos.'}
                        </p>
                    </div>

                    <div className="bg-[#111111] p-1.5 rounded-2xl flex mb-8">
                        <button
                            type="button"
                            onClick={() => { setIsRegister(false); setError(''); }}
                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${!isRegister ? 'bg-black text-white shadow-sm border border-[#333333]' : 'text-gray-400 hover:text-white'}`}
                        >
                            Fazer Login
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsRegister(true); setError(''); }}
                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${isRegister ? 'bg-black text-white shadow-sm border border-[#333333]' : 'text-gray-400 hover:text-white'}`}
                        >
                            Cadastre-se
                        </button>
                    </div>

                    {error && (
                        <div className="bg-[#1a0f14] border border-[#4a1f2f] text-[#ff4d85] p-4 rounded-xl mb-6 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {isRegister ? (
                        <form onSubmit={handleRegister} className="flex flex-col gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Nome Completo</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-4 bg-black border border-[#333333] rounded-xl outline-none focus:border-[#E11383] text-white transition-colors"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Como você gostaria de ser chamada?"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">E-mail</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full p-4 bg-black border border-[#333333] rounded-xl outline-none focus:border-[#E11383] text-white transition-colors"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu.email@exemplo.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">WhatsApp</label>
                                <input
                                    type="tel"
                                    required
                                    className="w-full p-4 bg-black border border-[#333333] rounded-xl outline-none focus:border-[#E11383] text-white transition-colors"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="(DDD) 90000-0000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Código da Personal</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-4 bg-black border border-[#333333] rounded-xl outline-none focus:border-[#E11383] text-white transition-colors uppercase"
                                    value={trainerCode}
                                    onChange={(e) => setTrainerCode(e.target.value)}
                                    placeholder="Ex: MK2024"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Senha</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full p-4 bg-black border border-[#333333] rounded-xl outline-none focus:border-[#E11383] text-white transition-colors"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Sua senha secreta"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full mt-2 py-4 rounded-xl font-bold text-white transition-all ${loading ? 'opacity-50 cursor-not-allowed bg-[#333333]' : 'bg-[#E11383] hover:bg-[#c90d72] shadow-[0_0_20px_rgba(225,19,131,0.3)]'}`}
                            >
                                {loading ? 'Cadastrando...' : 'Criar minha conta'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleLogin} className="flex flex-col gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">E-mail</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full p-4 bg-black border border-[#333333] rounded-xl outline-none focus:border-[#E11383] text-white transition-colors"
                                    placeholder="seu.email@exemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2 flex justify-between">
                                    <span>Senha</span>
                                </label>
                                <input
                                    type="password"
                                    required
                                    className="w-full p-4 bg-black border border-[#333333] rounded-xl outline-none focus:border-[#E11383] text-white transition-colors"
                                    placeholder="Sua senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full mt-2 py-4 rounded-xl font-bold text-white transition-all ${loading ? 'opacity-50 cursor-not-allowed bg-[#333333]' : 'bg-[#E11383] hover:bg-[#c90d72] shadow-[0_0_20px_rgba(225,19,131,0.3)]'}`}
                            >
                                {loading ? 'Entrando...' : 'Entrar no sistema'}
                            </button>
                        </form>
                    )}
                    
                    <p className="text-center text-[#666666] text-xs font-medium mt-10">
                        &copy; {new Date().getFullYear()} M&K Fitness Center. Todos os direitos reservados.
                    </p>
                </div>
            </div>
            {/* Show manifesto at the bottom on mobile instead of hiding entirely */}
            <div className="md:hidden w-full border-t border-[#1a1a1a]">
                 <ManifestoBanner />
            </div>
        </div>
    );
}