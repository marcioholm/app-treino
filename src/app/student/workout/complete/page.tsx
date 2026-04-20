'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
    searchParams: Promise<{ logId?: string; result?: string }>;
}

export default function WorkoutCompletePage({ searchParams }: Props) {
    const params = use(searchParams);
    const router = useRouter();
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            const p = await params;
            if (!p.result) {
                router.push('/student');
                return;
            }
            try {
                setResult(JSON.parse(atob(p.result)));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [params, router]);

    const handleShare = async () => {
        if (!result) return;
        try {
            await navigator.share({
                title: 'Treino concluído!',
                text: `Completei ${result.totalSets} séries com ${result.totalVolume?.toFixed(0)}kg em ${result.durationMinutes} minutos!`,
            });
        } catch (e) {
            console.log('Share not supported');
        }
    };

    if (loading || !result) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-gray-400">Carregando...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="text-6xl mb-4">🏆</div>
                <h1 className="text-3xl font-bold text-white mb-8">Treino Concluído!</h1>

                <div className="bg-[#111111] rounded-2xl p-6 mb-6">
                    <p className="text-gray-400 text-sm">Volume total</p>
                    <p className="text-4xl font-bold text-white mb-2">
                        {result.totalVolume?.toFixed(0)} kg
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-[#111111] rounded-xl p-4">
                        <p className="text-gray-400 text-xs">Séries</p>
                        <p className="text-2xl font-bold text-white">{result.totalSets}</p>
                    </div>
                    <div className="bg-[#111111] rounded-xl p-4">
                        <p className="text-gray-400 text-xs">Tempo</p>
                        <p className="text-2xl font-bold text-white">{result.durationMinutes} min</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleShare}
                        className="flex-1 bg-[#222222] text-white py-3 rounded-xl font-medium"
                    >
                        Compartilhar
                    </button>
                    <button
                        onClick={() => router.push('/student')}
                        className="flex-1 bg-[#D4537E] text-white py-3 rounded-xl font-medium"
                    >
                        Início
                    </button>
                </div>
            </div>
        </div>
    );
}