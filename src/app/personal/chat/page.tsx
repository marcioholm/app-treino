'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Send, ArrowLeft, MessageCircle } from 'lucide-react';
import GradientButton from '@/components/trainer/GradientButton';

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
        
        const interval = setInterval(() => {
            if (studentId) fetchMessages(studentId);
        }, 1500);
        return () => clearInterval(interval);
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
        
        const contentSent = newMessage;
        setNewMessage('');
        
        const tempId = `temp-${Date.now()}`;
        setMessages(prev => [...prev, {
            id: tempId,
            content: contentSent,
            senderRole: 'TRAINER',
            createdAt: new Date().toISOString()
        }]);

        setSending(true);
        try {
            await fetch('/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: contentSent, studentId: activeChat.studentId })
            });
            fetchMessages(activeChat.studentId);
        } catch (err) {
            console.error(err);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)]">
            <div className={`w-full md:w-80 border-r border-border bg-card ${activeChat ? 'hidden md:block' : ''}`}>
                <div className="p-4 border-b border-border">
                    <h1 className="font-display text-lg font-bold text-foreground">Mensagens</h1>
                </div>
                <div className="overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
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
                                className={`w-full p-4 text-left hover:bg-white/5 transition-colors border-b border-border/50 ${
                                    activeChat?.id === conv.id ? 'bg-primary-soft' : ''
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-primary-foreground font-bold">
                                        {conv.student?.user?.name?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground truncate">
                                            {conv.student?.user?.name || 'Aluno'}
                                        </p>
                                        <p className="text-sm text-muted-foreground truncate">
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
                <div className="flex-1 flex flex-col bg-background">
                    <div className="p-4 border-b border-border bg-card flex items-center gap-3">
                        <button
                            onClick={() => {
                                setActiveChat(null);
                                router.push('/personal/chat');
                            }}
                            className="md:hidden text-muted-foreground"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-primary-foreground font-bold">
                            {activeChat.student?.user?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                            <h2 className="font-display font-bold text-foreground">{activeChat.student?.user?.name}</h2>
                            <p className="text-xs text-muted-foreground">{activeChat.student?.user?.email}</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.senderRole !== 'STUDENT' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                                        msg.senderRole !== 'STUDENT'
                                            ? 'bg-gradient-brand text-primary-foreground'
                                            : 'bg-card border border-border text-foreground'
                                    }`}
                                >
                                    <p className="text-sm">{msg.content}</p>
                                    <p className={`text-[10px] mt-1 ${msg.senderRole !== 'STUDENT' ? 'text-white/70' : 'text-muted-foreground'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={sendMessage} className="p-4 border-t border-border bg-card">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Digite sua mensagem..."
                                className="flex-1 px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-foreground placeholder:text-muted-foreground"
                            />
                            <GradientButton 
                                type="submit"
                                disabled={sending || !newMessage.trim()}
                                className="px-4"
                            >
                                <Send size={18} />
                            </GradientButton>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground">
                    <div className="text-center">
                        <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Selecione uma conversa para começar</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PersonalChat() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-full bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        }>
            <ChatContent />
        </Suspense>
    );
}