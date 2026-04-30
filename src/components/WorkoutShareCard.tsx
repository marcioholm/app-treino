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

    const generateImage = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set dimensions (Story format: 1080x1920)
        canvas.width = 1080;
        canvas.height = 1920;

        const primary = stats.branding?.primaryColor || '#D4537E';
        const secondary = stats.branding?.secondaryColor || '#111111';
        const gymName = stats.branding?.gymName || 'M&K FITNESS CENTER';

        // 1. Background Gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
        gradient.addColorStop(0, '#1a1a1a');
        gradient.addColorStop(0.5, `${primary}22`); // Low opacity primary
        gradient.addColorStop(1, '#111111');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1080, 1920);

        // 2. Decorative circles (Branding feel)
        ctx.fillStyle = `${primary}1a`; // 10% opacity primary
        ctx.beginPath();
        ctx.arc(1080, 0, 600, 0, Math.PI * 2);
        ctx.fill();

        // 3. Logo Placeholder (or Text Logo)
        ctx.fillStyle = primary;
        ctx.font = 'bold 80px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(gymName.toUpperCase(), 540, 300);
        
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '30px sans-serif';
        ctx.fillText('TRAINER OS • SMART WORKOUT', 540, 350);

        // 4. Main Stats Container
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.roundRect?.(100, 600, 880, 800, 60);
        ctx.fill();
        ctx.strokeStyle = `${primary}4d`; // 30% opacity primary
        ctx.lineWidth = 4;
        ctx.stroke();

        // 5. Workout Name
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 90px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(stats.workoutName.toUpperCase(), 540, 800);

        // 6. Horizontal Divider
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath();
        ctx.moveTo(250, 880);
        ctx.lineTo(830, 880);
        ctx.stroke();

        // 7. Duration
        ctx.fillStyle = primary;
        ctx.font = 'bold 160px sans-serif';
        ctx.fillText(stats.duration, 540, 1100);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '40px sans-serif';
        ctx.fillText('TEMPO DE TREINO', 540, 1160);

        // 8. Weight Volume
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 100px sans-serif';
        ctx.fillText(`${stats.totalWeight} KG`, 540, 1320);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '40px sans-serif';
        ctx.fillText('VOLUME TOTAL', 540, 1370);

        // 9. Footer Info
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '40px sans-serif';
        ctx.fillText(stats.date, 540, 1750);
        ctx.fillText(`@${gymName.replace(/\s+/g, '').toUpperCase()}`, 540, 1820);

        // 10. Download
        const link = document.createElement('a');
        link.download = `treino-mk-${new Date().getTime()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            <canvas ref={canvasRef} className="hidden" />
            <button 
                onClick={generateImage}
                className="w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                BAIXAR CARD PARA STORIES
            </button>
        </div>
    );
}
