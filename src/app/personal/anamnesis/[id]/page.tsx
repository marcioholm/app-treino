'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';

const questionTypes = ['TEXT', 'NUMBER', 'BOOLEAN', 'MULTIPLE_CHOICE'];

export default function AnamnesisDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [template, setTemplate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch(`/api/anamnesis/templates/${id}`)
            .then(res => res.json())
            .then(data => {
                setTemplate(data.template);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const addSection = async () => {
        const name = prompt('Nome da seção (ex: Saúde, Nutrição):');
        if (!name) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/anamnesis/templates/${id}/sections`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            if (res.ok) {
                const data = await res.json();
                setTemplate(data.template);
            }
        } finally {
            setSaving(false);
        }
    };

    const addQuestion = async (sectionId: string) => {
        const text = prompt('Texto da pergunta:');
        if (!text) return;
        const type = prompt(`Tipo da pergunta (${questionTypes.join(', ')}):`);
        if (!type || !questionTypes.includes(type)) return alert('Tipo inválido');
        const required = confirm('Obrigatória?');
        
        setSaving(true);
        try {
            const res = await fetch(`/api/anamnesis/templates/${id}/questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sectionId, text, type, required })
            });
            if (res.ok) {
                const data = await res.json();
                setTemplate(data.template);
            }
        } finally {
            setSaving(false);
        }
    };

    const deleteQuestion = async (questionId: string) => {
        if (!confirm('Excluir esta pergunta?')) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/anamnesis/templates/${id}/questions/${questionId}`, { method: 'DELETE' });
            if (res.ok) {
                const data = await res.json();
                setTemplate(data.template);
            }
        } finally {
            setSaving(false);
        }
    };

    const deleteSection = async (sectionId: string) => {
        if (!confirm('Excluir toda a seção e suas perguntas?')) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/anamnesis/templates/${id}/sections/${sectionId}`, { method: 'DELETE' });
            if (res.ok) {
                const data = await res.json();
                setTemplate(data.template);
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-400">Carregando formulário...</div>;
    }

    if (!template) {
        return <div className="p-8 text-center text-red-500">Formulário não encontrado.</div>;
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/personal/anamnesis" className="text-gray-400 hover:text-gray-400">
                    &larr; Voltar
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">{template.name}</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        {template.isDefault ? 'Formulário padrão ativo' : 'Formulário customizado'}
                    </p>
                </div>
            </div>

            <button
                onClick={addSection}
                disabled={saving}
                className="bg-[#D4537E] hover:bg-[#993556] disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium"
            >
                + Nova Seção
            </button>

            {!template.sections?.length ? (
                <div className="bg-[#111111] border-2 border-dashed border-[#333333] rounded-xl p-12 text-center">
                    <p className="text-gray-400">Nenhuma seção. Clique em "+ Nova Seção" para começar.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {template.sections.map((section: any, idx: number) => (
                        <div key={section.id} className="bg-[#111111] rounded-xl shadow-sm border border-[#333333] overflow-hidden">
                            <div className="bg-black px-6 py-4 flex items-center justify-between border-b border-[#333333]">
                                <h3 className="font-semibold text-gray-100">{idx + 1}. {section.name}</h3>
                                <button onClick={() => deleteSection(section.id)} className="text-red-400 text-sm hover:text-red-300">
                                    Excluir
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                {section.questions?.length === 0 && (
                                    <p className="text-gray-500 text-sm">Nenhuma pergunta nesta seção.</p>
                                )}
                                {section.questions?.map((q: any) => (
                                    <div key={q.id} className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-white mb-1">
                                                {q.text} {q.required && <span className="text-red-500">*</span>}
                                            </p>
                                            <p className="text-xs text-gray-500">Tipo: {q.type}</p>
                                        </div>
                                        <button onClick={() => deleteQuestion(q.id)} className="text-red-400 text-xs hover:text-red-300">
                                            ×
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => addQuestion(section.id)}
                                    className="text-[#D4537E] text-sm hover:underline"
                                >
                                    + Adicionar pergunta
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
