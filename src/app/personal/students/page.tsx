'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function StudentsList() {
    const [students, setStudents] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({ name: '', email: '', password: '', birthDate: '' });

    const fetchStudents = async () => {
        try {
            const res = await fetch('/api/students', {
                headers: { 'x-tenant-id': 'cm69j63z20000ux2g6vve87ee' } // Hack until dynamic session tenantId logic is extracted to frontend or layout
            });
            const data = await res.json();
            if (data.students) setStudents(data.students);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
        
    };

    useEffect(() => { fetchStudents(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/students', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-tenant-id': 'cm69j63z20000ux2g6vve87ee'
                },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                setIsModalOpen(false);
                setForm({ name: '', email: '', password: '', birthDate: '' });
                fetchStudents();
            } else {
                const data = await res.json();
                alert(data.error || 'Erro ao criar aluno');
            }
        } catch (e) {
            alert('Erro ao criar aluno');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Alunas</h1>
                    <p className="text-gray-400 text-sm mt-1">Gerencie suas alunas, treinos e confira aniversários.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#D4537E] hover:bg-[#993556] text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                    + Nova Aluna
                </button>
            </div>

            <div className="bg-[#111111] rounded-xl border border-[#333333] shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[#333333]">
                    <input
                        type="text"
                        placeholder="Buscar aluna..."
                        className="w-full md:w-96 px-4 py-2 bg-black border border-[#333333] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4537E] text-white"
                    />
                </div>
                
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Carregando alunas...</div>
                ) : (
                    <>
                        <table className="w-full text-left border-collapse hidden md:table">
                            <thead>
                                <tr className="bg-black border-b border-[#333333] text-gray-400 text-sm">
                                    <th className="p-4 font-medium">Nome</th>
                                    <th className="p-4 font-medium">Nascimento</th>
                                    <th className="p-4 font-medium">Status do Treino</th>
                                    <th className="p-4 font-medium text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#333333]">
                                {students.map((student) => (
                                    <tr key={student.id} className="hover:bg-black transition-colors group">
                                        <td className="p-4">
                                            <div className="font-medium text-white">{student.user.name}</div>
                                            <div className="text-sm text-gray-400">{student.user.email}</div>
                                        </td>
                                        <td className="p-4 text-gray-400">
                                            {student.user.birthDate ? new Date(student.user.birthDate).toLocaleDateString('pt-BR') : '-'}
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#D4537E]/20 text-[#D4537E]">
                                                Ativo
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link href={`/personal/students/${student.id}`} className="text-[#D4537E] hover:text-[#ff80a6] font-medium text-sm">
                                                Acessar
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Mobile View */}
                        <div className="md:hidden divide-y divide-[#333333]">
                            {students.map((student) => (
                                <Link key={student.id} href={`/personal/students/${student.id}`} className="block p-4 hover:bg-black active:bg-[#1a1a1a]">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-medium text-white">{student.user.name}</span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#D4537E]/20 text-[#D4537E] uppercase tracking-wide">
                                            Ativo
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-400">{student.user.email}</div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-[#111111] border border-[#333333] rounded-2xl w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b border-[#333333] flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white">Cadastrar Nova Aluna</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <form onSubmit={handleCreate} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Nome Completo</label>
                                <input 
                                    required 
                                    className="w-full px-3 py-2 bg-black border border-[#333333] rounded-lg text-white" 
                                    value={form.name} 
                                    onChange={e => setForm({...form, name: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">E-mail</label>
                                <input 
                                    type="email" 
                                    required 
                                    className="w-full px-3 py-2 bg-black border border-[#333333] rounded-lg text-white" 
                                    value={form.email} 
                                    onChange={e => setForm({...form, email: e.target.value})} 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Senha Inicial</label>
                                    <input 
                                        type="password" 
                                        required 
                                        className="w-full px-3 py-2 bg-black border border-[#333333] rounded-lg text-white" 
                                        value={form.password} 
                                        onChange={e => setForm({...form, password: e.target.value})} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Data Nascimento</label>
                                    <input 
                                        type="date" 
                                        className="w-full px-3 py-2 bg-black border border-[#333333] rounded-lg text-white style-color-scheme-dark" 
                                        value={form.birthDate} 
                                        onChange={e => setForm({...form, birthDate: e.target.value})} 
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400 font-medium">Cancelar</button>
                                <button type="submit" className="bg-[#D4537E] text-white px-4 py-2 rounded-lg font-medium">Salvar Aluna</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
