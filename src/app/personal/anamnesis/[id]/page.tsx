'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';

export default function AnamnesisDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [template, setTemplate] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/anamnesis/templates/${id}`)
            .then(res => res.json())
            .then(data => {
                setTemplate(data.template);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

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
                        {template.isDefault ? 'Este é o formulário padrão que novos alunos respondem.' : 'Formulário customizado.'}
                    </p>
                </div>
            </div>

            <div className="bg-[#111111] rounded-xl shadow-sm border border-[#333333] overflow-hidden">
                {template.sections.map((section: any, idx: number) => (
                    <div key={section.id} className="border-b border-[#333333] last:border-b-0">
                        <div className="bg-black px-6 py-4 font-semibold text-gray-100 border-b border-[#333333]">
                            {idx + 1}. {section.name}
                        </div>
                        <div className="p-6 space-y-6">
                            {section.questions.map((q: any) => (
                                <div key={q.id}>
                                    <p className="text-sm font-medium text-white mb-2">
                                        {q.text} {q.required && <span className="text-red-500">*</span>}
                                    </p>

                                    {q.type === 'TEXT' && (
                                        <input disabled type="text" placeholder="Resposta em texto curto" className="w-full bg-black border border-[#333333] text-gray-400 p-2 rounded-lg text-sm" />
                                    )}
                                    {q.type === 'NUMBER' && (
                                        <input disabled type="number" placeholder="0" className="w-32 bg-black border border-[#333333] text-gray-400 p-2 rounded-lg text-sm" />
                                    )}
                                    {q.type === 'BOOLEAN' && (
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 text-sm text-gray-400"><input type="radio" disabled /> Sim</label>
                                            <label className="flex items-center gap-2 text-sm text-gray-400"><input type="radio" disabled /> Não</label>
                                        </div>
                                    )}
                                    {q.type === 'MULTIPLE_CHOICE' && (
                                        <div className="space-y-2">
                                            {q.options.map((opt: string, i: number) => (
                                                <label key={i} className="flex items-center gap-2 text-sm text-gray-400">
                                                    <input type="radio" disabled /> {opt}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
