'use client';
import { useEffect, useState } from 'react';

export default function LibraryManager() {
    const [exercises, setExercises] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetch('/api/library/exercises')
            .then(res => res.json())
            .then(data => {
                setExercises(data.exercises || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, exerciseId: string, type: 'image' | 'video') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'exercises');

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (res.ok && data.url) {
                // Now link this URL to the exercise
                const updateRes = await fetch(`/api/library/exercises/${exerciseId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        [type === 'image' ? 'imageUrl' : 'videoUrl']: data.url
                    })
                });

                if (updateRes.ok) {
                    setExercises(prev => prev.map(ex =>
                        ex.id === exerciseId ? { ...ex, [type === 'image' ? 'imageUrl' : 'videoUrl']: data.url } : ex
                    ));
                } else {
                    alert('Erro ao vincular arquivo ao exercício.');
                }
            } else {
                alert(data.error || 'Erro ao fazer upload');
            }
        } catch (error) {
            alert('Erro de conexão ao enviar arquivo.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Biblioteca de Exercícios</h1>
                    <p className="text-gray-500 mt-1">Gerencie os vídeos e imagens de demonstração para seus alunos.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors">
                    + Novo Exercício
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Carregando biblioteca...</div>
            ) : exercises.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
                    <p className="text-gray-500">Nenhum exercício encontrado. Peça para o admin rodar os seeds.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">Nome</th>
                                    <th className="px-6 py-4">Grupo / Equipamento</th>
                                    <th className="px-6 py-4 text-center">Mídia (Imagem/Vídeo)</th>
                                    <th className="px-6 py-4 text-center">MET</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {exercises.map(ex => (
                                    <tr key={ex.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{ex.name}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold mr-2">
                                                {ex.group}
                                            </span>
                                            <span className="text-xs text-gray-500">{ex.equipment || 'Variado'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-4">
                                                <div className="flex flex-col items-center gap-1">
                                                    {ex.imageUrl ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={ex.imageUrl} alt={ex.name} className="w-10 h-10 object-cover rounded shadow-sm border border-gray-200" />
                                                    ) : (
                                                        <label className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded border border-gray-200 cursor-pointer hover:bg-gray-200 relative">
                                                            <span className="text-xs text-gray-400">IMG</span>
                                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, ex.id, 'image')} disabled={isUploading} />
                                                        </label>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-center gap-1">
                                                    {ex.videoUrl ? (
                                                        <span className="w-10 h-10 flex items-center justify-center bg-green-100 text-green-700 rounded text-xs font-bold">VID</span>
                                                    ) : (
                                                        <label className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded border border-gray-200 cursor-pointer hover:bg-gray-200 relative">
                                                            <span className="text-xs text-gray-400">MP4</span>
                                                            <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, ex.id, 'video')} disabled={isUploading} />
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {ex.defaultMET ? ex.defaultMET.toFixed(1) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">Editar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
