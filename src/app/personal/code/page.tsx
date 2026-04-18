import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';
import { redirect } from 'next/navigation';

export default async function TrainerCode() {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('mk_app_token')?.value;
    const payload = tokenCookie ? await verifyToken(tokenCookie) : null;

    if (!payload || (payload.role !== 'TRAINER' && payload.role !== 'OWNER_PERSONAL')) {
        redirect('/login');
    }

    const trainer = await prisma.user.findUnique({
        where: { id: payload.userId },
    });

    const studentCode = trainer?.studentCode || trainer?.id.slice(0, 8).toUpperCase();

    if (!trainer?.studentCode && trainer) {
        await prisma.user.update({
            where: { id: trainer.id },
            data: { studentCode },
        });
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '28rem', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ 
                    width: '4rem', 
                    height: '4rem', 
                    borderRadius: '0.75rem',
                    background: 'linear-gradient(135deg, #D4537E 0%, #993556 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem'
                }}>
                    <span style={{ color: 'white', fontWeight: 'bold' }}>M&K</span>
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a' }}>Código da Coach</h1>
                <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Compartilhe este código com suas alunas</p>
            </div>

            <div style={{ 
                background: 'linear-gradient(135deg, #D4537E 0%, #993556 100%)',
                borderRadius: '1.5rem', 
                padding: '2rem',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Seu código único</p>
                <p style={{ color: 'white', fontSize: '2.25rem', fontWeight: '800', letterSpacing: '0.25em' }}>{studentCode}</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', marginTop: '1rem' }}>M&K Fitness Center</p>
            </div>

            <button
                onClick={() => navigator.clipboard.writeText(studentCode || '')}
                style={{ 
                    width: '100%', 
                    padding: '1rem', 
                    backgroundColor: '#D4537E',
                    color: 'white',
                    fontWeight: '600',
                    borderRadius: '1rem',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '1.5rem'
                }}
            >
                📋 Copiar código
            </button>

            <div style={{ 
                backgroundColor: '#FBEAF0', 
                borderRadius: '1rem', 
                padding: '1.25rem',
                marginTop: '1.5rem',
                border: '1px solid #F4C0D1'
            }}>
                <p style={{ fontSize: '0.875rem', color: '#72243E' }}>
                    <strong>Como funciona:</strong> Suas alunas devem inserir este código ao se cadastrarem no app.
                </p>
            </div>
        </div>
    );
}