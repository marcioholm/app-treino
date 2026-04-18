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

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning) {
            interval = setInterval(() => {
                setActiveSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const startTimer = () => setIsRunning(true);
    const pauseTimer = () => setIsRunning(false);
    const resetTimer = () => {
        setIsRunning(false);
        setActiveSeconds(0);
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
