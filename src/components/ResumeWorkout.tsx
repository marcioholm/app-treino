'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ResumeWorkout() {
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

    useEffect(() => {
        // Look for any keys starting with mk_workout_logs_
        const keys = Object.keys(localStorage);
        const logKey = keys.find(k => k.startsWith('mk_workout_logs_'));
        
        if (logKey) {
            const sessionId = logKey.replace('mk_workout_logs_', '');
            setActiveSessionId(sessionId);
        }
    }, []);

    if (!activeSessionId) return null;

    return (
        <Link 
            href={`/student/workout/${activeSessionId}`}
            className="block w-full bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-4 shadow-lg animate-pulse"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm">Treino em Andamento</h4>
                        <p className="text-white/80 text-xs">Toque para continuar de onde parou</p>
                    </div>
                </div>
                <div className="bg-white text-orange-600 px-3 py-1 rounded-lg text-xs font-black uppercase">
                    Continuar
                </div>
            </div>
        </Link>
    );
}
