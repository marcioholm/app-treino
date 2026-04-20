'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AnamnesisManager() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewForm, setShowNewForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [creating, setCreating] = useState(false);
    const router = useRouter();

    const fetchTemplates = () => {
        fetch('/api/anamnesis/templates')
            .then(res => res.json())
            .then(data => {
                setTemplates(data.templates || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleCreate = async () => {
        if (!newName.trim()) return;
        setCreating(true);
        try {
            const res = await fetch('/api/anamnesis/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName })
            });
            if (res.ok) {
                setShowNewForm(false);
                setNewName('');
                fetchTemplates();
            }
        } finally {
            setCreating(false);
        }
    };

    const handleActivate = async (templateId: string) => {
        try {
            const res = await fetch(`/api/anamnesis/templates/${templateId}/activate`, { method: 'POST' });
            if (res.ok) {
                fetchTemplates();
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Anamnese / Formulários</h1>
                    <p className="text-gray-400 mt-1">Gerencie as perguntas que seus alunos respondem antes de iniciar o treinamento.</p>
                </div>
                <button 
                    onClick={() => setShowNewForm(true)}
                    className="bg-[#D4537E] hover:bg-[#993556] text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
                >
                    + Novo Formulário
                </button>
            </div>

            {showNewForm && (
                <div className="bg-[#111111] border border-[#333333] rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Novo Formulário</h3>
                    <input
                        type="text"
                        placeholder="Nome do formulário"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full border border-[#444444] rounded-lg p-3 bg-black text-white outline-none focus:border-[#D4537E] mb-4"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleCreate}
                            disabled={creating || !newName.trim()}
                            className="flex-1 bg-[#D4537E] hover:bg-[#993556] disabled:opacity-50 text-white py-2 rounded-lg font-medium"
                        >
                            {creating ? 'Criando...' : 'Criar'}
                        </button>
                        <button
                            onClick={() => { setShowNewForm(false); setNewName(''); }}
                            className="px-4 py-2 border border-[#333333] text-gray-300 rounded-lg hover:bg-[#1a1a1a]"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center py-12 text-gray-400">Carregando...</div>
            ) : templates.length === 0 ? (
                <div className="bg-[#111111] border-2 border-dashed border-[#333333] rounded-xl p-12 text-center">
                    <p className="text-gray-400">Nenhum formulário encontrado.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map(template => (
                        <div key={template.id} className="bg-[#111111] border border-[#333333] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative">
                            {template.isDefault && (
                                <span className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">
                                    Ativo
                                </span>
                            )}
                            <h3 className="text-lg font-bold text-white mb-2">{template.name}</h3>
                            <p className="text-sm text-gray-400 mb-6">
                                {template.sections?.length || 0} Seções • {template.sections?.reduce((acc: number, s: any) => acc + (s.questions?.length || 0), 0) || 0} Perguntas
                            </p>

                            <div className="flex gap-2">
                                <Link href={`/personal/anamnesis/${template.id}`} className="flex-1 bg-black hover:bg-[#1a1a1a] text-gray-300 border border-[#333333] text-center py-2 rounded-lg text-sm font-medium transition-colors">
                                    Editar
                                </Link>
                                {!template.isDefault && (
                                    <button 
                                        onClick={() => handleActivate(template.id)}
                                        className="px-3 py-2 border border-[#333333] text-gray-300 rounded-lg text-sm hover:bg-[#1a1a1a]"
                                    >
                                        Ativar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
