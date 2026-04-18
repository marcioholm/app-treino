import Link from 'next/link';

export default function StudentsList() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Alunos</h1>
                    <p className="text-gray-500 text-sm mt-1">Gerencie seus alunos e prescreva treinos.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
                    + Novo Aluno
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <input
                        type="text"
                        placeholder="Buscar aluno..."
                        className="w-full md:w-96 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <table className="w-full text-left border-collapse hidden md:table">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                            <th className="p-4 font-medium">Nome</th>
                            <th className="p-4 font-medium">Objetivo</th>
                            <th className="p-4 font-medium">Status do Treino</th>
                            <th className="p-4 font-medium text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors group">
                                <td className="p-4">
                                    <div className="font-medium text-gray-900">João Silva {i}</div>
                                    <div className="text-sm text-gray-500">joao{i}@email.com</div>
                                </td>
                                <td className="p-4 text-gray-600">Hipertrofia</td>
                                <td className="p-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Ativo
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <Link href={`/personal/students/${i}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                                        Acessar
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Mobile View */}
                <div className="md:hidden divide-y divide-gray-100">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Link key={i} href={`/personal/students/${i}`} className="block p-4 hover:bg-gray-50 active:bg-gray-100">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-gray-900">João Silva {i}</span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800 uppercase tracking-wide">
                                    Ativo
                                </span>
                            </div>
                            <div className="text-sm text-gray-500">Hipertrofia</div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
