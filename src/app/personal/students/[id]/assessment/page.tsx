'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewAssessment({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [formData, setFormData] = useState({
        weight: '',
        height: '',
        goal: 'HIPERTROFIA',
        level: 'INTERMEDIARY'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`/api/students/${id}/assessment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    weight: parseFloat(formData.weight),
                    height: parseFloat(formData.height),
                    goal: formData.goal,
                    level: formData.level
                })
            });

            if (res.ok) {
                router.push(`/personal/students/${id}`);
                router.refresh();
            } else {
                alert('Erro ao salvar avaliação');
            }
        } catch (e) {
            console.error(e);
            alert('Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl border border-gray-100 shadow-sm mt-8">
            <div className="flex items-center gap-4 mb-6">
                <Link href={`/personal/students/${id}`} className="text-gray-400 hover:text-gray-600">
                    &larr; Voltar
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Nova Avaliação</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500"
                            value={formData.weight}
                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Altura (m)</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500"
                            value={formData.height}
                            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo</label>
                        <select
                            className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 bg-white"
                            value={formData.goal}
                            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                        >
                            <option value="HIPERTROFIA">Hipertrofia</option>
                            <option value="EMAGRECIMENTO">Emagrecimento</option>
                            <option value="CONDICIONAMENTO">Condicionamento</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nível</label>
                        <select
                            className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 bg-white"
                            value={formData.level}
                            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        >
                            <option value="BEGINNER">Iniciante</option>
                            <option value="INTERMEDIARY">Intermediário</option>
                            <option value="ADVANCED">Avançado</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-xl transition-colors shadow-sm"
                    >
                        {loading ? 'Salvando...' : 'Salvar Avaliação'}
                    </button>
                </div>
            </form>
        </div>
    );
}
