'use client';
import Link from 'next/link';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);

    const handleMagicGenerate = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch(`/api/students/${id}/workouts/generate`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                router.push(`/personal/workouts/${data.workout?.id || 'new'}/editor`);
            } else {
                alert('Erro ao gerar treino mágico! O aluno precisa ter avaliação e objetivo cadastrados no banco.');
            }
        } catch (e) {
            console.error(e);
            alert('Erro de conexão ao gerar treino.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/personal/students" className="text-gray-400 hover:text-gray-400">
                    &larr; Voltar
                </Link>
                <h1 className="text-2xl font-bold text-white">Detalhes do Aluno</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Sidebar info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#111111] p-6 rounded-xl border border-[#333333] shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-[#D4537E]/20 text-[#D4537E] rounded-full flex items-center justify-center text-2xl font-bold">
                                JS
                            </div>
                            <div>
                                <h2 className="font-bold text-lg text-white">João Silva {id}</h2>
                                <p className="text-gray-400 text-sm">joao@email.com</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-[#333333]">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-semibold">Objetivo</p>
                                <p className="text-white font-medium">Hipertrofia</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-semibold">Nível</p>
                                <p className="text-white font-medium">Intermediário</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-semibold">Avaliação Recente</p>
                                <p className="text-white font-medium">82kg • 1.80m (IMC 25.3)</p>
                            </div>
                        </div>

                        <button
                            onClick={() => alert('Nova Avaliação em breve!')}
                            className="w-full mt-6 bg-black hover:bg-[#1a1a1a] text-gray-300 border border-[#333333] py-2 rounded-lg font-medium transition-colors"
                        >
                            Nova Avaliação
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#111111] p-6 rounded-xl border border-[#333333] shadow-sm">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                            <h2 className="text-lg font-bold text-white">Treinos</h2>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => router.push(`/personal/workouts/new/editor?studentId=${id}`)}
                                    className="flex-1 sm:flex-none bg-[#111111] border border-[#333333] hover:bg-black text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                                >
                                    Gerar Manual
                                </button>
                                <button
                                    onClick={handleMagicGenerate}
                                    disabled={isGenerating}
                                    className="flex-1 sm:flex-none bg-[#D4537E] hover:bg-[#993556] disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                                >
                                    {isGenerating ? 'Gerando...' : 'Gerar Treino Mágico ✨'}
                                </button>
                            </div>
                        </div>

                        <div className="border border-[#333333] rounded-lg overflow-hidden">
                            <div className="p-4 flex items-center justify-between bg-black border-b border-[#333333]">
                                <div>
                                    <h3 className="font-semibold text-white">Treino Automático - Hipertrofia (4x)</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">Gerado em 01/03/2026 • Status: Rascunho</p>
                                </div>
                                <div className="flex gap-2">
                                    <Link href={`/personal/workouts/uuid-mock/editor`} className="px-3 py-1.5 bg-[#111111] border border-[#333333] text-gray-300 text-sm font-medium rounded hover:bg-black transition-colors">
                                        Editar
                                    </Link>
                                    <button className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors shadow-sm">
                                        Publicar
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="text-sm text-gray-400">Este treino contém 4 sessões (Upper A, Lower A, Upper B, Lower B).</p>
                            </div>
                        </div>

                        <div className="mt-4 p-8 text-center border-2 border-dashed border-[#333333] rounded-lg">
                            <p className="text-gray-400 text-sm">Nenhum treino publicado no momento.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
