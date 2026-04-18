'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
        <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
            <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <Link href="/student/today" className="text-gray-400 p-2 -ml-2 hover:bg-gray-50 rounded-full">
                    &larr; Voltar
                </Link>
                <h1 className="font-bold text-gray-900 text-center flex-1 pr-8">Check-in Semanal</h1>
            </header>

            <main className="flex-1 overflow-auto p-4 max-w-md mx-auto w-full">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Como foi a sua semana?</h2>
                    <p className="text-gray-500 text-sm mb-6">Suas respostas ajudam o treinador a ajustar o volume e a intensidade dos próximos treinos.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Peso atual */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Qual o seu peso atual (kg)?</label>
                            <input
                                type="number"
                                step="0.1"
                                name="weight"
                                required
                                value={formData.weight}
                                onChange={handleChange}
                                placeholder="Ex: 75.5"
                                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 font-medium"
                            />
                        </div>

                        {/* Energy */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Nível de Energia</label>
                            <div className="flex justify-between text-xs text-gray-500 font-medium px-1 mb-1">
                                <span>Exausto (1)</span>
                                <span>Excelente (5)</span>
                            </div>
                            <input
                                type="range"
                                name="energy"
                                min="1" max="5"
                                value={formData.energy}
                                onChange={handleChange}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="text-center font-bold text-blue-600">{formData.energy} / 5</div>
                        </div>

                        {/* Sleep */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Qualidade de Sono</label>
                            <div className="flex justify-between text-xs text-gray-500 font-medium px-1 mb-1">
                                <span>Péssima (1)</span>
                                <span>Perfeita (5)</span>
                            </div>
                            <input
                                type="range"
                                name="sleep"
                                min="1" max="5"
                                value={formData.sleep}
                                onChange={handleChange}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="text-center font-bold text-blue-600">{formData.sleep} / 5</div>
                        </div>

                        {/* Soreness */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Dores Musculares</label>
                            <div className="flex justify-between text-xs text-gray-500 font-medium px-1 mb-1">
                                <span>Muitas dores (1)</span>
                                <span>Recuperado (5)</span>
                            </div>
                            <input
                                type="range"
                                name="soreness"
                                min="1" max="5"
                                value={formData.soreness}
                                onChange={handleChange}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="text-center font-bold text-blue-600">{formData.soreness} / 5</div>
                        </div>

                        {/* Motivation */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Nível de Motivação</label>
                            <div className="flex justify-between text-xs text-gray-500 font-medium px-1 mb-1">
                                <span>Desmotivado (1)</span>
                                <span>Focado (5)</span>
                            </div>
                            <input
                                type="range"
                                name="motivation"
                                min="1" max="5"
                                value={formData.motivation}
                                onChange={handleChange}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="text-center font-bold text-blue-600">{formData.motivation} / 5</div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Alguma observação?</label>
                            <textarea
                                name="notes"
                                rows={3}
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Senti um desconforto no joelho, dormi mal terça..."
                                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 resize-none font-medium"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !formData.weight}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-sm ${loading || !formData.weight ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md active:scale-95'}`}
                        >
                            {loading ? 'Salvando...' : 'Enviar Check-in'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
