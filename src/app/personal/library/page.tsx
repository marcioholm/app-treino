'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

const exerciseGroups = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core', 'Cardio'];

export default function LibraryManager() {
    const [exercises, setExercises] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [groupFilter, setGroupFilter] = useState('');
    const [selectedExercise, setSelectedExercise] = useState<any>(null);

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

    const filteredExercises = exercises.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGroup = !groupFilter || ex.group === groupFilter;
        return matchesSearch && matchesGroup;
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Biblioteca de Exercícios</h1>
                    <p className="text-gray-500 text-sm">{exercises.length} exercícios cadastrados</p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={groupFilter}
                        onChange={(e) => setGroupFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Todos os grupos</option>
                        {exerciseGroups.map(g => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="Buscar exercício..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Carregando...</div>
            ) : (
                /* Exercise Grid */
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredExercises.map(ex => (
                        <div
                            key={ex.id}
                            onClick={() => setSelectedExercise(ex)}
                            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
                        >
                            {/* Preview Image */}
                            <div className="relative h-32 bg-gray-100">
                                {ex.imageUrl ? (
                                    <img src={ex.imageUrl} alt={ex.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-3xl font-bold text-gray-300">{ex.name.charAt(0)}</span>
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-bold">
                                        {ex.group}
                                    </span>
                                </div>
                                {ex.videoUrl && (
                                    <div className="absolute bottom-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                        </svg>
                                        Vídeo
                                    </div>
                                )}
                            </div>
                            <div className="p-3">
                                <h3 className="font-semibold text-gray-900 text-sm truncate">{ex.name}</h3>
                                <p className="text-xs text-gray-500">{ex.equipment || 'Variado'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Exercise Detail Modal */}
            {selectedExercise && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedExercise(null)}>
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="relative h-48 bg-gray-100">
                            {selectedExercise.imageUrl ? (
                                <img src={selectedExercise.imageUrl} alt={selectedExercise.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-5xl font-bold text-gray-300">{selectedExercise.name.charAt(0)}</span>
                                </div>
                            )}
                            <button
                                onClick={() => setSelectedExercise(null)}
                                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{selectedExercise.name}</h2>
                                <p className="text-gray-500">{selectedExercise.group} {selectedExercise.subgroup ? `• ${selectedExercise.subgroup}` : ''}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Equipamento</p>
                                    <p className="font-medium text-gray-900">{selectedExercise.equipment || 'Variado'}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Modalidade</p>
                                    <p className="font-medium text-gray-900">{selectedExercise.modality}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Tipo</p>
                                    <p className="font-medium text-gray-900">{selectedExercise.type}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500">MET</p>
                                    <p className="font-medium text-gray-900">{selectedExercise.defaultMET || '-'}</p>
                                </div>
                            </div>

                            {selectedExercise.description && (
                                <div>
                                    <p className="text-sm text-gray-500">Descrição</p>
                                    <p className="text-gray-900">{selectedExercise.description}</p>
                                </div>
                            )}

                            <div className="border-t pt-4">
                                <p className="text-sm font-medium text-gray-700 mb-3">Adicionar Mídia</p>
                                <div className="flex gap-4">
                                    <label className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-sm text-gray-600">Imagem</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, selectedExercise.id, 'image')} disabled={isUploading} />
                                    </label>
                                    <label className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-sm text-gray-600">Vídeo</span>
                                        <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, selectedExercise.id, 'video')} disabled={isUploading} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}