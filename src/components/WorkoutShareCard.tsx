'use client';

import { useRef } from 'react';

interface ShareStats {
    workoutName: string;
    duration: string;
    totalWeight: string;
    date: string;
    branding?: {
        gymName: string;
        logoUrl?: string;
        primaryColor?: string;
        secondaryColor?: string;
    }
}

export default function WorkoutShareCard({ stats }: { stats: ShareStats }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const generateImage = (mode: 'story' | 'sticker') => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const primary = stats.branding?.primaryColor || '#D4537E';
        const gymName = stats.branding?.gymName || 'M&K FITNESS CENTER';

        if (mode === 'story') {
            // Story format: 1080x1920
            canvas.width = 1080;
            canvas.height = 1920;

            // Background Gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
            gradient.addColorStop(0, '#1a1a1a');
            gradient.addColorStop(0.5, `${primary}22`);
            gradient.addColorStop(1, '#111111');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 1080, 1920);

            // Decorative circles
            ctx.fillStyle = `${primary}1a`;
            ctx.beginPath();
            ctx.arc(1080, 0, 600, 0, Math.PI * 2);
            ctx.fill();

            // Logo
            ctx.fillStyle = primary;
            ctx.font = 'bold 80px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(gymName.toUpperCase(), 540, 300);
            
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.font = '30px sans-serif';
            ctx.fillText('TRAINER OS • SMART WORKOUT', 540, 350);

            // Main Stats
            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            ctx.roundRect?.(100, 600, 880, 800, 60);
            ctx.fill();
            ctx.strokeStyle = `${primary}4d`;
            ctx.lineWidth = 4;
            ctx.stroke();

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 90px sans-serif';
            ctx.fillText(stats.workoutName.toUpperCase(), 540, 800);

            ctx.fillStyle = primary;
            ctx.font = 'bold 160px sans-serif';
            ctx.fillText(stats.duration, 540, 1100);
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = '40px sans-serif';
            ctx.fillText('TEMPO DE TREINO', 540, 1160);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 100px sans-serif';
            ctx.fillText(`${stats.totalWeight} KG`, 540, 1320);
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = '40px sans-serif';
            ctx.fillText('VOLUME TOTAL', 540, 1370);

            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.font = '40px sans-serif';
            ctx.fillText(stats.date, 540, 1750);
            ctx.fillText(`@${gymName.replace(/\s+/g, '').toUpperCase()}`, 540, 1820);
        } else {
            // Sticker mode: 1080x280 (Horizontal glass bar)
            canvas.width = 1080;
            canvas.height = 280;

            // Clear background for transparency
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 1. Semi-transparent Glass Bar
            ctx.fillStyle = 'rgba(15, 15, 15, 0.85)';
            ctx.roundRect?.(20, 20, 1040, 240, 120);
            ctx.fill();
            
            // Subtle border
            ctx.strokeStyle = `${primary}44`;
            ctx.lineWidth = 3;
            ctx.stroke();

            // 2. Dividers
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(280, 70); ctx.lineTo(280, 210);
            ctx.moveTo(540, 70); ctx.lineTo(540, 210);
            ctx.moveTo(800, 70); ctx.lineTo(800, 210);
            ctx.stroke();

            ctx.textAlign = 'center';
            
            // Calculate Calories (Simplified: ~400 kcal/hr)
            const [mins, secs] = stats.duration.split(':').map(Number);
            const totalMins = mins + (secs / 60);
            const kcal = Math.round(totalMins * 6.5); // ~390 kcal/hr

            // Stat 1: Duration
            ctx.fillStyle = primary;
            ctx.font = 'bold 60px sans-serif';
            ctx.fillText(stats.duration, 150, 145);
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = 'bold 22px sans-serif';
            ctx.fillText('TEMPO', 150, 185);

            // Stat 2: Volume
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 60px sans-serif';
            ctx.fillText(`${stats.totalWeight}`, 410, 145);
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = 'bold 22px sans-serif';
            ctx.fillText('VOLUME KG', 410, 185);

            // Stat 3: Calories
            ctx.fillStyle = primary;
            ctx.font = 'bold 60px sans-serif';
            ctx.fillText(`${kcal}`, 670, 145);
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = 'bold 22px sans-serif';
            ctx.fillText('KCAL EST.', 670, 185);

            // Gym Name / Branding
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 32px sans-serif';
            const shortName = gymName.length > 12 ? gymName.substring(0, 12) + '...' : gymName;
            ctx.fillText(shortName.toUpperCase(), 910, 145);
            ctx.fillStyle = primary;
            ctx.font = 'bold 18px sans-serif';
            ctx.fillText('TRAINER OS', 910, 180);
        }

        const link = document.createElement('a');
        link.download = `treino-mk-${mode}-${new Date().getTime()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    return (
        <div className="flex flex-col items-center gap-3 w-full">
            <canvas ref={canvasRef} className="hidden" />
            <button 
                onClick={() => generateImage('sticker')}
                className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 transition-all border-2 border-white/20"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                BAIXAR ADESIVO (TRANSPARENTE)
            </button>
            <button 
                onClick={() => generateImage('story')}
                className="w-full bg-transparent text-white border-2 border-white/20 font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/5 active:scale-95 transition-all"
            >
                MODO STORY COMPLETO
            </button>
        </div>
    );
}
