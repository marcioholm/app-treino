'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentChat() {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/chat');
            const data = await res.json();
            setMessages(data.messages || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;
        
        setSending(true);
        try {
            await fetch('/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newMessage })
            });
            setNewMessage('');
            fetchMessages();
        } catch (err) {
            console.error(err);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full max-w-md mx-auto">
            <div className="p-4 border-b border-gray-200 bg-white">
                <h1 className="text-lg font-bold text-gray-900">Mensagens</h1>
                <p className="text-sm text-gray-500">Fale com seu personal</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        <p>Nenhuma mensagem ainda.</p>
                        <p className="text-sm">Envie uma mensagem para começar a conversa!</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.senderRole === 'STUDENT' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                                    msg.senderRole === 'STUDENT'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-900'
                                }`}
                            >
                                <p className="text-sm">{msg.content}</p>
                                <p className={`text-[10px] mt-1 ${msg.senderRole === 'STUDENT' ? 'text-blue-200' : 'text-gray-500'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                    >
                        Enviar
                    </button>
                </div>
            </form>
        </div>
    );
}