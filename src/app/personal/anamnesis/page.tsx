'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AnamnesisManager() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/anamnesis/templates')
            .then(res => res.json())
            .then(data => {
                setTemplates(data.templates || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Anamnese / Formulários</h1>
                    <p className="text-gray-500 mt-1">Gerencie as perguntas que seus alunos respondem antes de iniciar o treinamento.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors">
                    + Novo Formulário
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Carregando...</div>
            ) : templates.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
                    <p className="text-gray-500">Nenhum formulário encontrado.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map(template => (
                        <div key={template.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative">
                            {template.isDefault && (
                                <span className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">
                                    Padrão Ativo
                                </span>
                            )}
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{template.name}</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                {template.sections.length} Seções • {template.sections.reduce((acc: number, s: any) => acc + s.questions.length, 0)} Perguntas
                            </p>

                            <div className="flex gap-2">
                                <Link href={`/personal/anamnesis/${template.id}`} className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-center py-2 rounded-lg text-sm font-medium transition-colors">
                                    Ver Detalhes
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
