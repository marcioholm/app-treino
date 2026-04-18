'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ChatContent() {
    const [conversations, setConversations] = useState<any[]>([]);
    const [activeChat, setActiveChat] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const studentId = searchParams.get('studentId');

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (studentId) {
            const conv = conversations.find(c => c.studentId === studentId);
            if (conv) {
                setActiveChat(conv);
                fetchMessages(studentId);
            }
        }
    }, [studentId, conversations]);

    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/chat/conversations');
            const data = await res.json();
            setConversations(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (sid: string) => {
        try {
            const res = await fetch(`/api/chat?studentId=${sid}`);
            const data = await res.json();
            setMessages(data.messages || []);
        } catch (err) {
            console.error(err);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending || !activeChat) return;
        
        setSending(true);
        try {
            await fetch('/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newMessage, studentId: activeChat.studentId })
            });
            setNewMessage('');
            fetchMessages(activeChat.studentId);
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
        <div className="flex h-[calc(100vh-64px)]">
            <div className={`w-full md:w-80 border-r border-gray-200 bg-white ${activeChat ? 'hidden md:block' : ''}`}>
                <div className="p-4 border-b border-gray-200">
                    <h1 className="text-lg font-bold text-gray-900">Mensagens</h1>
                </div>
                <div className="overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            Nenhuma conversa ainda.
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => {
                                    setActiveChat(conv);
                                    fetchMessages(conv.studentId);
                                    router.push(`/personal/chat?studentId=${conv.studentId}`);
                                }}
                                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                                    activeChat?.id === conv.id ? 'bg-blue-50' : ''
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                        {conv.student?.user?.name?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">
                                            {conv.student?.user?.name || 'Aluno'}
                                        </p>
                                        <p className="text-sm text-gray-500 truncate">
                                            {conv.messages[0]?.content || 'Sem mensagens'}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {activeChat ? (
                <div className="flex-1 flex flex-col">
                    <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-3">
                        <button
                            onClick={() => {
                                setActiveChat(null);
                                router.push('/personal/chat');
                            }}
                            className="md:hidden text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h2 className="font-bold text-gray-900">{activeChat.student?.user?.name}</h2>
                            <p className="text-xs text-gray-500">{activeChat.student?.user?.email}</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.senderRole !== 'STUDENT' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                                        msg.senderRole !== 'STUDENT'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-900'
                                    }`}
                                >
                                    <p className="text-sm">{msg.content}</p>
                                    <p className={`text-[10px] mt-1 ${msg.senderRole !== 'STUDENT' ? 'text-blue-200' : 'text-gray-500'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Digite sua mensagem..."
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                disabled={sending || !newMessage.trim()}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl font-medium"
                            >
                                Enviar
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 items-center justify-center text-gray-500">
                    Selecione uma conversa para começar
                </div>
            )}
        </div>
    );
}

export default function PersonalChat() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        }>
            <ChatContent />
        </Suspense>
    );
}