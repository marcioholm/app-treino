'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { History, Calendar, UserRound, LogOut, Award, Camera } from 'lucide-react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const NotificationManager = dynamic(() => import('@/components/NotificationManager'), { ssr: false });

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<{
        name: string, 
        email: string, 
        avatarUrl: string|null,
        stats?: {
            workoutsCount: number,
            currentWeight: number | null,
            weightDiff: number | null
        }
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetch('/api/student/me')
            .then(res => res.json())
            .then(data => {
                setProfile(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'avatars');

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.url) {
                // Update avatar url in database
                await fetch('/api/student/me', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ avatarUrl: data.url })
                });
                
                setProfile(prev => prev ? { ...prev, avatarUrl: data.url } : null);
            }
        } catch (error) {
            console.error('Upload failed', error);
            alert('Falha ao atualizar foto de perfil');
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {
            console.error('Logout error:', e);
        }
        router.push('/login');
    };

    return (
        <div className="flex flex-col h-screen bg-black pb-20">
            <header className="bg-[#111111] px-6 py-5 border-b border-[#333333] shadow-sm sticky top-0 z-10 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white tracking-tight">Perfil</h1>
                <NotificationManager />
            </header>

            <main className="flex-1 p-4 lg:p-6 overflow-auto max-w-md mx-auto w-full space-y-6">

                {/* Profile Header */}
                <div className="bg-[#111111] rounded-2xl p-6 border border-[#333333] shadow-sm flex flex-col items-center text-center">
                    <div className="relative mb-4">
                        <div className="w-24 h-24 bg-[#1a1a1a] border-2 border-[#D4537E] text-[#D4537E] rounded-full flex items-center justify-center text-3xl font-bold overflow-hidden shadow-xl">
                            {uploading ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4537E]"></div>
                            ) : profile?.avatarUrl ? (
                                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                profile?.name ? profile.name.substring(0, 2).toUpperCase() : '...'
                            )}
                        </div>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 bg-[#D4537E] p-2 rounded-full border-2 border-[#111111] text-white shadow-md active:scale-95 transition-transform"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                        />
                    </div>
                    
                    {loading ? (
                        <div className="w-32 h-6 bg-[#333333] animate-pulse rounded mb-2"></div>
                    ) : (
                        <h2 className="text-xl font-bold text-white tracking-tight">{profile?.name}</h2>
                    )}
                    
                    {loading ? (
                        <div className="w-40 h-4 bg-[#1a1a1a] animate-pulse rounded"></div>
                    ) : (
                        <p className="text-gray-400 text-sm">{profile?.email}</p>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#111111] p-4 rounded-xl border border-[#333333] shadow-sm flex flex-col items-center justify-center">
                        <Award className="w-8 h-8 text-[#D4537E] mb-2" />
                        <span className="text-2xl font-bold text-white">
                            {loading ? '...' : profile?.stats?.workoutsCount || 0}
                        </span>
                        <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold text-center">Treinos Feitos</span>
                    </div>
                    <div className="bg-[#111111] p-4 rounded-xl border border-[#333333] shadow-sm flex flex-col items-center justify-center">
                        {!loading && profile?.stats?.currentWeight ? (
                            <>
                                {profile.stats.weightDiff !== null && profile.stats.weightDiff !== 0 && (
                                    <span className={cn(
                                        "text-sm font-bold mb-1",
                                        profile.stats.weightDiff > 0 ? "text-primary-light" : "text-success"
                                    )}>
                                        {profile.stats.weightDiff > 0 ? '↑' : '↓'} {Math.abs(profile.stats.weightDiff).toFixed(1)}kg
                                    </span>
                                )}
                                <span className="block text-xl font-bold text-white">{profile.stats.currentWeight} kg</span>
                            </>
                        ) : (
                            <span className="block text-xl font-bold text-white">—</span>
                        )}
                        <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold text-center">Peso Atual</span>
                    </div>
                </div>

                {/* Logout */}
                <div className="pt-6">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-[#1a0f14] border border-[#4a1f2f] text-[#ff4d85] py-4 rounded-xl font-bold hover:bg-[#2a141b] transition-colors">
                        <LogOut className="w-5 h-5" />
                        Sair da Conta
                    </button>
                </div>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 w-full bg-[#111111] border-t border-[#333333] px-6 py-3 flex justify-between items-center pb-safe-bottom z-50 md:hidden">
                <Link href="/student/today" className="flex flex-col items-center gap-1 text-gray-400">
                    <Calendar className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Hoje</span>
                </Link>
                <Link href="/student/history" className="flex flex-col items-center gap-1 text-gray-400">
                    <History className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Histórico</span>
                </Link>
                <Link href="/student/profile" className="flex flex-col items-center gap-1 text-[#D4537E]">
                    <UserRound className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Perfil</span>
                </Link>
            </nav>
        </div>
    );
}
