'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GradientButton from '@/components/trainer/GradientButton';
import { ArrowLeft } from 'lucide-react';

export default function StudentCheckIn() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        weight: '',
        energy: '3',
        sleep: '3',
        soreness: '3',
        motivation: '3',
        notes: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/student/checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                router.push('/student/today');
            } else {
                alert('Erro ao enviar check-in.');
            }
        } catch (error) {
            console.error(error);
            alert('Falha na conexão.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background pb-24">
            <header className="bg-card border-b border-border px-4 py-4 flex items-center justify-between sticky top-0 z-10">
                <Link href="/student/today" className="text-muted-foreground p-2 -ml-2 hover:bg-white/5 rounded-full transition">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="font-display font-bold text-foreground text-center flex-1">Check-in Semanal</h1>
                <div className="w-10" />
            </header>

            <main className="flex-1 overflow-auto p-4 max-w-md mx-auto w-full">
                <div className="bg-card p-6 rounded-2xl border border-border shadow-pink mb-6">
                    <h2 className="font-display text-xl font-bold text-foreground mb-2">Como foi a sua semana?</h2>
                    <p className="text-muted-foreground text-sm mb-6">Suas respostas ajudam o treinador a ajustar o volume e a intensidade dos próximos treinos.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Peso atual */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-foreground">Qual o seu peso atual (kg)?</label>
                            <input
                                type="number"
                                step="0.1"
                                name="weight"
                                required
                                value={formData.weight}
                                onChange={handleChange}
                                placeholder="Ex: 75.5"
                                className="w-full p-4 bg-background border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground font-medium text-foreground"
                            />
                        </div>

                        {/* Energy */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-foreground">Nível de Energia</label>
                            <div className="flex justify-between text-xs text-muted-foreground font-medium px-1 mb-1">
                                <span>Exausto (1)</span>
                                <span>Excelente (5)</span>
                            </div>
                            <input
                                type="range"
                                name="energy"
                                min="1" max="5"
                                value={formData.energy}
                                onChange={handleChange}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <div className="text-center font-bold text-primary">{formData.energy} / 5</div>
                        </div>

                        {/* Sleep */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-foreground">Qualidade de Sono</label>
                            <div className="flex justify-between text-xs text-muted-foreground font-medium px-1 mb-1">
                                <span>Péssima (1)</span>
                                <span>Perfeita (5)</span>
                            </div>
                            <input
                                type="range"
                                name="sleep"
                                min="1" max="5"
                                value={formData.sleep}
                                onChange={handleChange}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <div className="text-center font-bold text-primary">{formData.sleep} / 5</div>
                        </div>

                        {/* Soreness */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-foreground">Dores Musculares</label>
                            <div className="flex justify-between text-xs text-muted-foreground font-medium px-1 mb-1">
                                <span>Muitas dores (1)</span>
                                <span>Recuperado (5)</span>
                            </div>
                            <input
                                type="range"
                                name="soreness"
                                min="1" max="5"
                                value={formData.soreness}
                                onChange={handleChange}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <div className="text-center font-bold text-primary">{formData.soreness} / 5</div>
                        </div>

                        {/* Motivation */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-foreground">Nível de Motivação</label>
                            <div className="flex justify-between text-xs text-muted-foreground font-medium px-1 mb-1">
                                <span>Desmotivado (1)</span>
                                <span>Focado (5)</span>
                            </div>
                            <input
                                type="range"
                                name="motivation"
                                min="1" max="5"
                                value={formData.motivation}
                                onChange={handleChange}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <div className="text-center font-bold text-primary">{formData.motivation} / 5</div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-foreground">Alguma observação?</label>
                            <textarea
                                name="notes"
                                rows={3}
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Senti um desconforto no joelho, dormi mal terça..."
                                className="w-full p-4 bg-background border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground resize-none font-medium text-foreground"
                            ></textarea>
                        </div>

                        <GradientButton 
                            type="submit" 
                            className="w-full" 
                            size="lg"
                            disabled={loading || !formData.weight}
                        >
                            {loading ? 'Salvando...' : 'Enviar Check-in'}
                        </GradientButton>
                    </form>
                </div>
            </main>
        </div>
    );
}