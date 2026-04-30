'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TimerContextType {
    activeSeconds: number;
    isRunning: boolean;
    startTimer: () => void;
    pauseTimer: () => void;
    resetTimer: () => void;
}

const TimerContext = createContext<TimerContextType>({
    activeSeconds: 0,
    isRunning: false,
    startTimer: () => { },
    pauseTimer: () => { },
    resetTimer: () => { }
});

export function TimerProvider({ children }: { children: ReactNode }) {
    const [activeSeconds, setActiveSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load initial state
    useEffect(() => {
        try {
            const savedTime = localStorage.getItem('mk_timer_seconds');
            const savedRunning = localStorage.getItem('mk_timer_running');
            if (savedTime) setActiveSeconds(Number(savedTime));
            if (savedRunning === 'true') setIsRunning(true);
        } catch (e) {
            console.error('Failed to load timer state', e);
        }
        setIsHydrated(true);
    }, []);

    // Persist state
    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem('mk_timer_seconds', activeSeconds.toString());
            localStorage.setItem('mk_timer_running', isRunning.toString());
        }
    }, [activeSeconds, isRunning, isHydrated]);

    useEffect(() => {
        let interval: any;
        if (isRunning && isHydrated) {
            interval = setInterval(() => {
                setActiveSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning, isHydrated]);

    const startTimer = () => setIsRunning(true);
    const pauseTimer = () => setIsRunning(false);
    const resetTimer = () => {
        setIsRunning(false);
        setActiveSeconds(0);
        localStorage.removeItem('mk_timer_seconds');
        localStorage.removeItem('mk_timer_running');
    };

    return (
        <TimerContext.Provider value={{ activeSeconds, isRunning, startTimer, pauseTimer, resetTimer }}>
            {children}
        </TimerContext.Provider>
    );
}

export function useWorkoutTimer() {
    return useContext(TimerContext);
}
