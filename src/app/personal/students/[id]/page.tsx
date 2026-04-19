'use client';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Student {
    id: string;
    phone: string | null;
    user: { name: string; email: string };
    assessments: { weight: number; height: number; bmi: number; createdAt: string }[];
    goals: { objective: string; level: string; daysPerWeek: number }[];
    weeklyCheckIns: { weight: number; energy: number; sleep: number; soreness: number; motivation: number; notes: string | null; createdAt: string }[];
}

export default function StudentDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        fetch(`/api/students/${id}`)
            .then(res => res.json())
            .then(data => setStudent(data.student))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    const handleMagicGenerate = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch(`/api/students/${id}/workouts/generate`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                router.push(`/personal/workouts/${data.workout?.id || 'new'}/editor?studentId=${id}`);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</div>;
    }

    if (!student) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Aluno não encontrado</div>;
    }

    const latestAssessment = student.assessments[0];
    const latestGoal = student.goals[0];
    const checkIns = student.weeklyCheckIns || [];

    return (
        <div style={{ padding: '1.5rem', maxWidth: '60rem', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <button 
                    onClick={() => router.push('/personal/students')}
                    style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
                >
                    ← Voltar
                </button>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.5rem' }}>Detalhes do Aluno</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                {/* Info do Aluno */}
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ 
                            width: '4rem', 
                            height: '4rem', 
                            borderRadius: '50%', 
                            backgroundColor: '#DBEAFE', 
                            color: '#2563EB',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 'bold'
                        }}>
                            {student.user.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                        </div>
                        <div>
                            <h2 style={{ fontWeight: '700', fontSize: '1.25rem' }}>{student.user.name}</h2>
                            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{student.user.email}</p>
                            {student.phone && <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>📱 {student.phone}</p>}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
                        {latestGoal && (
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>Objetivo</p>
                                <p style={{ fontWeight: '500' }}>{latestGoal.objective}</p>
                            </div>
                        )}
                        {latestGoal && (
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>Nível</p>
                                <p style={{ fontWeight: '500' }}>{latestGoal.level}</p>
                            </div>
                        )}
                        {latestGoal && (
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>Dias/Semana</p>
                                <p style={{ fontWeight: '500' }}>{latestGoal.daysPerWeek}x</p>
                            </div>
                        )}
                        {latestAssessment && (
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>Peso</p>
                                <p style={{ fontWeight: '500' }}>{latestAssessment.weight}kg</p>
                            </div>
                        )}
                        {latestAssessment && (
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>Altura</p>
                                <p style={{ fontWeight: '500' }}>{latestAssessment.height}m</p>
                            </div>
                        )}
                        {latestAssessment && (
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>IMC</p>
                                <p style={{ fontWeight: '500' }}>{latestAssessment.bmi}</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => router.push(`/personal/students/${id}/assessment`)}
                        style={{ 
                            width: '100%', 
                            marginTop: '1rem', 
                            padding: '0.75rem',
                            backgroundColor: '#f9fafb', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            cursor: 'pointer'
                        }}
                    >
                        + Nova Avaliação
                    </button>
                </div>

                {/* Check-ins Semanais */}
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontWeight: '700', fontSize: '1.125rem', marginBottom: '1rem' }}>Check-ins Semanais</h3>
                    
                    {checkIns.length === 0 ? (
                        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Nenhum check-in realizado ainda.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {checkIns.map((check, i) => (
                                <div key={i} style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                            {new Date(check.createdAt).toLocaleDateString('pt-BR')}
                                        </span>
                                        <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>📊</span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#D4537E' }}>{check.weight}kg</p>
                                            <p style={{ fontSize: '0.625rem', color: '#6b7280' }}>PESO</p>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <p style={{ fontSize: '1.25rem', fontWeight: '700', color: check.energy >= 7 ? '#10B981' : check.energy >= 4 ? '#F59E0B' : '#EF4444' }}>{check.energy}/10</p>
                                            <p style={{ fontSize: '0.625rem', color: '#6b7280' }}>ENERGIA</p>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <p style={{ fontSize: '1.25rem', fontWeight: '700', color: check.sleep >= 7 ? '#10B981' : check.sleep >= 5 ? '#F59E0B' : '#EF4444' }}>{check.sleep}h</p>
                                            <p style={{ fontSize: '0.625rem', color: '#6b7280' }}>SONO</p>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <p style={{ fontSize: '1.25rem', fontWeight: '700', color: check.soreness <= 3 ? '#10B981' : check.soreness <= 6 ? '#F59E0B' : '#EF4444' }}>{check.soreness}/10</p>
                                            <p style={{ fontSize: '0.625rem', color: '#6b7280' }}>DOR</p>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <p style={{ fontSize: '1.25rem', fontWeight: '700', color: check.motivation >= 7 ? '#10B981' : check.motivation >= 4 ? '#F59E0B' : '#EF4444' }}>{check.motivation}/10</p>
                                            <p style={{ fontSize: '0.625rem', color: '#6b7280' }}>MOTIVAÇÃO</p>
                                        </div>
                                    </div>
                                    {check.notes && (
                                        <p style={{ fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' }}>"{check.notes}"</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Treinos */}
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontWeight: '700', fontSize: '1.125rem' }}>Treinos</h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => router.push(`/personal/workouts/new/editor?studentId=${id}`)}
                                style={{ padding: '0.5rem 1rem', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}
                            >
                                Gerar Manual
                            </button>
                            <button
                                onClick={handleMagicGenerate}
                                disabled={isGenerating}
                                style={{ padding: '0.5rem 1rem', backgroundColor: '#D4537E', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem', cursor: 'pointer', opacity: isGenerating ? 0.5 : 1 }}
                            >
                                {isGenerating ? 'Gerando...' : 'Gerar ✨'}
                            </button>
                        </div>
                    </div>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>
                        Nenhum treino publicado ainda.
                    </p>
                </div>
            </div>
        </div>
    );
}