'use client';
import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import GradientButton from '@/components/trainer/GradientButton';

export default function StudentChat() {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 1500);
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
        
        const contentSent = newMessage;
        setNewMessage('');
        
        const tempId = `temp-${Date.now()}`;
        setMessages(prev => [...prev, {
            id: tempId,
            content: contentSent,
            senderRole: 'STUDENT',
            createdAt: new Date().toISOString()
        }]);

        setSending(true);
        try {
            await fetch('/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: contentSent })
            });
            fetchMessages();
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
        <div className="flex flex-col h-full max-w-md mx-auto bg-background">
            <div className="p-4 border-b border-border bg-card">
                <h1 className="font-display text-lg font-bold text-foreground">Mensagens</h1>
                <p className="text-sm text-muted-foreground">Fale com seu personal</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
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
                                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                                    msg.senderRole === 'STUDENT'
                                        ? 'bg-gradient-brand text-primary-foreground'
                                        : 'bg-card border border-border text-foreground'
                                }`}
                            >
                                <p className="text-sm">{msg.content}</p>
                                <p className={`text-[10px] mt-1 ${msg.senderRole === 'STUDENT' ? 'text-white/70' : 'text-muted-foreground'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
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
    );
}