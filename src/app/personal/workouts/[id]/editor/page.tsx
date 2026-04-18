import Link from 'next/link';
import { use } from 'react';

export default function WorkoutEditor({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/personal/students/1" className="text-gray-400 hover:text-gray-600">
                        &larr; Voltar
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Editar Treino Automático</h1>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                        Salvar Rascunho
                    </button>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors">
                        Salvar e Publicar
                    </button>
                </div>
            </div>

            {["A - Push (Peito, Ombros, Tríceps)", "B - Pull (Costas, Bíceps)"].map((sessionName, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-6">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                        <h2 className="font-bold text-gray-900">{sessionName}</h2>
                        <button className="text-sm text-blue-600 hover:underline font-medium">+ Adicionar Exercício</button>
                    </div>

                    <div className="divide-y divide-gray-100 px-6">
                        <div className="py-4 flex gap-4 items-center group">
                            <div className="text-gray-400 cursor-move">⣿</div>
                            <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-5">
                                    <p className="font-semibold text-gray-900">Supino Reto Barra</p>
                                    <p className="text-xs text-gray-500">Peito • Barra Livre</p>
                                </div>
                                <div className="col-span-2 text-center">
                                    <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">Séries</label>
                                    <input type="number" defaultValue={4} className="w-16 p-2 bg-gray-50 border border-gray-200 rounded text-center text-gray-900 font-medium" />
                                </div>
                                <div className="col-span-2 text-center">
                                    <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">Reps</label>
                                    <input type="text" defaultValue="8-12" className="w-20 p-2 bg-gray-50 border border-gray-200 rounded text-center text-gray-900 font-medium" />
                                </div>
                                <div className="col-span-2 text-center">
                                    <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">Pausa (s)</label>
                                    <input type="number" defaultValue={90} className="w-16 p-2 bg-gray-50 border border-gray-200 rounded text-center text-gray-900 font-medium" />
                                </div>
                            </div>
                            <button className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded">
                                X
                            </button>
                        </div>

                        <div className="py-4 flex gap-4 items-center group">
                            <div className="text-gray-400 cursor-move">⣿</div>
                            <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-5">
                                    <p className="font-semibold text-gray-900">Desenvolvimento Halteres</p>
                                    <p className="text-xs text-gray-500">Ombros • Halteres</p>
                                </div>
                                <div className="col-span-2 text-center">
                                    <input type="number" defaultValue={3} className="w-16 p-2 bg-gray-50 border border-gray-200 rounded text-center text-gray-900 font-medium" />
                                </div>
                                <div className="col-span-2 text-center">
                                    <input type="text" defaultValue="10-12" className="w-20 p-2 bg-gray-50 border border-gray-200 rounded text-center text-gray-900 font-medium" />
                                </div>
                                <div className="col-span-2 text-center">
                                    <input type="number" defaultValue={60} className="w-16 p-2 bg-gray-50 border border-gray-200 rounded text-center text-gray-900 font-medium" />
                                </div>
                            </div>
                            <button className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded">
                                X
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
