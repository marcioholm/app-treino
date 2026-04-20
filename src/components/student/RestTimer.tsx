'use client';

import { useEffect, useState, useRef } from 'react';

interface RestTimerProps {
    duration: number;
    onComplete: () => void;
    exerciseName?: string;
}

export default function RestTimer({ duration, onComplete, exerciseName }: RestTimerProps) {
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isRunning, setIsRunning] = useState(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        if (navigator.vibrate) {
                            navigator.vibrate([200, 100, 200]);
                        }
                        onComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, timeLeft, onComplete]);

    const addTime = () => {
        setTimeLeft(prev => prev + 30);
    };

    const skip = () => {
        setIsRunning(false);
        onComplete();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = ((duration - timeLeft) / duration) * 100;

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <div className="bg-[#111111] border border-[#333333] rounded-2xl p-8 w-full max-w-sm text-center">
                <p className="text-gray-400 text-sm mb-2">Descansando</p>
                {exerciseName && (
                    <p className="text-gray-300 text-lg mb-4">após: {exerciseName}</p>
                )}
                
                <div className="relative w-40 h-40 mx-auto mb-6">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="80"
                            cy="80"
                            r="70"
                            fill="none"
                            stroke="#333333"
                            strokeWidth="8"
                        />
                        <circle
                            cx="80"
                            cy="80"
                            r="70"
                            fill="none"
                            stroke="#D4537E"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={440}
                            strokeDashoffset={440 - (440 * progress) / 100}
                            className="transition-all duration-1000"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-bold text-white">
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={addTime}
                        className="px-4 py-2 bg-[#222222] text-gray-300 rounded-lg"
                    >
                        +30s
                    </button>
                    <button
                        onClick={skip}
                        className="px-6 py-2 bg-[#D4537E] text-white rounded-lg font-medium"
                    >
                        Pular
                    </button>
                </div>
            </div>
        </div>
    );
}