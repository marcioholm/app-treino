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
        <div style={{ minHeight: '100vh', backgroundColor: '#1a1a1a', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ 
                        width: '4rem', 
                        height: '4rem', 
                        borderRadius: '0.75rem',
                        background: 'linear-gradient(135deg, #D4537E 0%, #993556 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem'
                    }}>
                        <span style={{ color: 'white', fontWeight: 'bold' }}>M&K</span>
                    </div>
                    <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: '800' }}>
                        M<span style={{ color: '#D4537E' }}>&</span>K
                    </h1>
                    <p style={{ color: '#D4537E', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.1em', marginTop: '0.5rem' }}>
                        Fitness Center
                    </p>
                </div>

                <div style={{ 
                    backgroundColor: 'rgba(255,255,255,0.95)', 
                    borderRadius: '1.5rem', 
                    padding: '2rem',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}>
                    <div style={{ display: 'flex', borderRadius: '1rem', backgroundColor: '#f9f5f7', padding: '0.25rem', marginBottom: '1.5rem' }}>
                        <button
                            type="button"
                            onClick={() => { setIsRegister(false); setError(''); }}
                            style={{ 
                                flex: 1, 
                                padding: '0.75rem', 
                                borderRadius: '0.75rem',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                border: 'none',
                                cursor: 'pointer',
                                backgroundColor: !isRegister ? 'white' : 'transparent',
                                color: !isRegister ? '#D4537E' : '#6b7280',
                                boxShadow: !isRegister ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
                            }}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsRegister(true); setError(''); }}
                            style={{ 
                                flex: 1, 
                                padding: '0.75rem', 
                                borderRadius: '0.75rem',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                border: 'none',
                                cursor: 'pointer',
                                backgroundColor: isRegister ? 'white' : 'transparent',
                                color: isRegister ? '#D4537E' : '#6b7280',
                                boxShadow: isRegister ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
                            }}
                        >
                            Cadastrar
                        </button>
                    </div>

                    {error && (
                        <div style={{ 
                            backgroundColor: '#fef2f2', 
                            color: '#dc2626', 
                            padding: '0.75rem', 
                            borderRadius: '0.5rem',
                            marginBottom: '1rem',
                            fontSize: '0.875rem'
                        }}>
                            {error}
                        </div>
                    )}

                    {isRegister ? (
                        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>Nome</label>
                                <input
                                    type="text"
                                    required
                                    style={{ width: '100%', padding: '0.875rem', backgroundColor: '#f9fafb', border: '2px solid transparent', borderRadius: '0.75rem', outline: 'none' }}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>E-mail</label>
                                <input
                                    type="email"
                                    required
                                    style={{ width: '100%', padding: '0.875rem', backgroundColor: '#f9fafb', border: '2px solid transparent', borderRadius: '0.75rem', outline: 'none' }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>Senha</label>
                                <input
                                    type="password"
                                    required
                                    style={{ width: '100%', padding: '0.875rem', backgroundColor: '#f9fafb', border: '2px solid transparent', borderRadius: '0.75rem', outline: 'none' }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>WhatsApp (opicional)</label>
                                <input
                                    type="tel"
                                    style={{ width: '100%', padding: '0.875rem', backgroundColor: '#f9fafb', border: '2px solid transparent', borderRadius: '0.75rem', outline: 'none' }}
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>Código do Personal</label>
                                <input
                                    type="text"
                                    required
                                    style={{ width: '100%', padding: '0.875rem', backgroundColor: '#f9fafb', border: '2px solid transparent', borderRadius: '0.75rem', outline: 'none' }}
                                    value={trainerCode}
                                    onChange={(e) => setTrainerCode(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{ 
                                    width: '100%', 
                                    padding: '1rem', 
                                    borderRadius: '0.75rem',
                                    fontWeight: '600',
                                    color: 'white',
                                    background: 'linear-gradient(135deg, #D4537E 0%, #993556 100%)',
                                    border: 'none',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.5 : 1
                                }}
                            >
                                {loading ? 'Cadastrando...' : 'Cadastrar'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>E-mail</label>
                                <input
                                    type="email"
                                    required
                                    style={{ width: '100%', padding: '0.875rem', backgroundColor: '#f9fafb', border: '2px solid transparent', borderRadius: '0.75rem', outline: 'none' }}
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>Senha</label>
                                <input
                                    type="password"
                                    required
                                    style={{ width: '100%', padding: '0.875rem', backgroundColor: '#f9fafb', border: '2px solid transparent', borderRadius: '0.75rem', outline: 'none' }}
                                    placeholder="Sua senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{ 
                                    width: '100%', 
                                    padding: '1rem', 
                                    borderRadius: '0.75rem',
                                    fontWeight: '600',
                                    color: 'white',
                                    background: 'linear-gradient(135deg, #D4537E 0%, #993556 100%)',
                                    border: 'none',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.5 : 1
                                }}
                            >
                                {loading ? 'Entrando...' : 'Entrar'}
                            </button>
                        </form>
                    )}
                </div>

                <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.75rem', marginTop: '2rem' }}>
                    Academia M&K Fitness Center · Arapoti/PR
                </p>
            </div>
        </div>
    );
}