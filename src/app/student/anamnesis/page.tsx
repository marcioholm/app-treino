'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentAnamnesis() {
    const router = useRouter();
    const [template, setTemplate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<any>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetch('/api/student/anamnesis')
            .then(res => res.json())
            .then(data => {
                if (data.hasAnswered) {
                    router.push('/student/today'); // Skip if already answered
                } else {
                    setTemplate(data.template);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [router]);

    const handleChange = (questionId: string, value: any, type: string) => {
        setAnswers((prev: any) => ({
            ...prev,
            [questionId]: { value, type }
        }));
    };

    const handleArrayChange = (questionId: string, option: string, checked: boolean) => {
        setAnswers((prev: any) => {
            const current = prev[questionId]?.value || [];
            const newValue = checked
                ? [...current, option]
                : current.filter((o: string) => o !== option);
            return {
                ...prev,
                [questionId]: { value: newValue, type: 'MULTIPLE_CHOICE' }
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const payload = Object.keys(answers).map(qId => {
            const ans = answers[qId];
            return {
                questionId: qId,
                answerText: ans.type === 'MULTIPLE_CHOICE' ? null : String(ans.value),
                answerArray: ans.type === 'MULTIPLE_CHOICE' ? ans.value : []
            }
        });

        try {
            const res = await fetch('/api/student/anamnesis/answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templateId: template.id, answers: payload })
            });
            if (res.ok) {
                router.push('/student/today');
            } else {
                alert('Erro ao enviar formulário.');
                setSubmitting(false);
            }
        } catch (e) {
            alert('Erro de conexão.');
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Preparando sua avaliação...</div>;
    if (!template) return <div className="p-8 text-center text-red-500">Nenhuma avaliação pendente encontrada.</div>;

    return (
        <div className="p-4 max-w-lg mx-auto pb-24">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-white">Avaliação Inicial</h1>
                <p className="text-gray-400 mt-1 text-sm">Responda as perguntas abaixo para que seu treinador possa montar o treino ideal para você.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                {template.sections.map((section: any, sIdx: number) => (
                    <div key={section.id} className="bg-[#111111] rounded-xl shadow-sm border border-[#333333] p-5">
                        <h2 className="font-bold text-[#D4537E] mb-4 pb-2 border-b border-[#333333]">{sIdx + 1}. {section.name}</h2>
                        <div className="space-y-6">
                            {section.questions.map((q: any) => (
                                <div key={q.id}>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        {q.text} {q.required && <span className="text-red-500">*</span>}
                                    </label>

                                    {q.type === 'TEXT' && (
                                        <input
                                            required={q.required}
                                            type="text"
                                            className="w-full border border-[#333333] rounded-lg p-3 outline-none focus:border-[#D4537E]"
                                            onChange={(e) => handleChange(q.id, e.target.value, 'TEXT')}
                                        />
                                    )}
                                    {q.type === 'NUMBER' && (
                                        <input
                                            required={q.required}
                                            type="number"
                                            className="w-full border border-[#333333] rounded-lg p-3 outline-none focus:border-[#D4537E]"
                                            onChange={(e) => handleChange(q.id, e.target.value, 'NUMBER')}
                                        />
                                    )}
                                    {q.type === 'BOOLEAN' && (
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2">
                                                <input type="radio" name={q.id} required={q.required} onChange={() => handleChange(q.id, 'true', 'BOOLEAN')} /> Sim
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input type="radio" name={q.id} required={q.required} onChange={() => handleChange(q.id, 'false', 'BOOLEAN')} /> Não
                                            </label>
                                        </div>
                                    )}
                                    {q.type === 'MULTIPLE_CHOICE' && (
                                        <div className="space-y-3">
                                            {q.options.map((opt: string, i: number) => (
                                                <label key={i} className="flex items-center gap-3 p-3 border border-[#333333] rounded-lg bg-black cursor-pointer hover:bg-[#1a1a1a] transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 text-[#D4537E] rounded border-[#444444] focus:ring-[#D4537E]"
                                                        onChange={(e) => handleArrayChange(q.id, opt, e.target.checked)}
                                                    />
                                                    <span className="text-sm text-gray-300">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#D4537E] hover:bg-[#993556] disabled:bg-[#4B1528] text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95"
                >
                    {submitting ? 'Enviando...' : 'Finalizar Avaliação'}
                </button>
            </form>
        </div>
    );
}
