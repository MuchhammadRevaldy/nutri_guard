import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import logo from '@/images/logo-nutri-copy.png';
import { X, Send, MessageCircle, Loader2 } from 'lucide-react';

const WELCOME = 'Halo! Saya asisten NutriGuard. Ada yang bisa saya bantu seputar nutrisi, fitur aplikasi, atau gizi keluarga?';

const QUICK_QUESTIONS = [
    'Apa itu NutriScan?',
    'Cara pakai FitChef?',
    'Berapa kalori nasi goreng?',
];

export default function ChatbotWidget() {
    const [open, setOpen]       = useState(false);
    const [input, setInput]     = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: WELCOME },
    ]);
    const bottomRef = useRef(null);
    const inputRef  = useRef(null);

    useEffect(() => {
        if (open) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [open, messages]);

    async function send(text) {
        const q = (text ?? input).trim();
        if (!q || loading) return;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: q }]);
        setLoading(true);

        try {
            const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
            const res = await axios.post('/chatbot', { message: q, history });
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Maaf, saya sedang tidak bisa merespons. Silakan coba beberapa saat lagi.',
            }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

            {/* Chat Window */}
            {open && (
                <div className="w-[340px] sm:w-[380px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
                    style={{ height: '480px' }}>

                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-500/60 to-teal-500/60 backdrop-blur-md border-b border-emerald-400/30">
                        <img src={logo} alt="" className="w-8 h-8 rounded-lg" />
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-sm leading-none">NutriGuard Support</p>
                            <p className="text-emerald-200 text-xs mt-0.5">AI Asisten · Online</p>
                        </div>
                        <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" aria-label="Tutup chat">
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {m.role === 'assistant' && (
                                    <img src={logo} alt="" className="w-6 h-6 rounded-md flex-shrink-0 mr-2 mt-0.5" />
                                )}
                                <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                    m.role === 'user'
                                        ? 'bg-emerald-500/60 backdrop-blur-sm border border-emerald-400/40 text-white rounded-br-sm'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                                }`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex items-center gap-2">
                                <img src={logo} alt="" className="w-6 h-6 rounded-md flex-shrink-0" />
                                <div className="bg-gray-100 dark:bg-gray-800 px-3.5 py-2.5 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Quick Questions — hanya tampil jika baru 1 pesan */}
                    {messages.length === 1 && (
                        <div className="px-4 pb-2 flex flex-wrap gap-2">
                            {QUICK_QUESTIONS.map(q => (
                                <button key={q} onClick={() => send(q)}
                                    className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-full border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors">
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                            placeholder="Ketik pesan..."
                            disabled={loading}
                            className="flex-1 px-3.5 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60 transition-colors"
                        />
                        <button
                            onClick={() => send()}
                            disabled={!input.trim() || loading}
                            className="w-9 h-9 bg-emerald-500/50 backdrop-blur-md border border-emerald-400/50 hover:bg-emerald-400/60 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center flex-shrink-0 transition-all shadow-md"
                            aria-label="Kirim pesan"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setOpen(v => !v)}
                className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-500/55 to-teal-500/55 backdrop-blur-md border border-emerald-400/50 hover:from-emerald-400/65 hover:to-teal-400/65 text-white rounded-2xl shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
                aria-label={open ? 'Tutup chat' : 'Buka chat'}
            >
                <img src={logo} alt="" className="w-8 h-8 rounded-lg" />
                {!open && (
                    <div className="text-left">
                        <p className="font-bold text-sm leading-none">NutriGuard Support</p>
                        <p className="text-emerald-200 text-xs mt-0.5">Punya keluhan? Tanyakan disini!</p>
                    </div>
                )}
                {open
                    ? <X className="w-5 h-5" />
                    : <span className="w-5 h-5 flex items-center justify-center text-lg font-bold">+</span>
                }
            </button>
        </div>
    );
}
