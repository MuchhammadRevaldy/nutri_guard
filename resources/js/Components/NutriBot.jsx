import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { X, Send, Minus, Sparkles, Bot } from 'lucide-react';
import axios from 'axios';

const QUICK_CHIPS = [
    { label: '🚀 Apa itu NutriGuard?',   text: 'Apa itu NutriGuard dan apa saja fiturnya?' },
    { label: '📊 Fitur-Fitur',             text: 'Sebutkan semua fitur utama NutriGuard' },
    { label: '🤖 Cara pakai AI',           text: 'Bagaimana cara menggunakan fitur AI di NutriGuard?' },
    { label: '🍱 Tips Meal Plan',          text: 'Berikan tips meal planning yang sehat untuk satu minggu' },
    { label: '🔥 Berapa kalori saya?',     text: 'Bagaimana cara menghitung kebutuhan kalori harian saya?' },
    { label: '📸 Cara pakai NutriScan',   text: 'Bagaimana cara menggunakan fitur NutriScan?' },
];

const WELCOME = {
    role: 'assistant',
    content: 'Halo! 👋 Saya **NutriBot**, asisten AI NutriGuard.\n\nSaya siap membantu kamu tentang nutrisi, fitur aplikasi, atau tips hidup sehat. Apa yang ingin kamu tanyakan?',
    time: new Date(),
};

function formatTime(date) {
    return new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function MessageBubble({ msg, animate = false }) {
    const isBot = msg.role === 'assistant';
    const renderContent = (text) => {
        const parts = text.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, i) =>
            part.startsWith('**') && part.endsWith('**')
                ? <strong key={i}>{part.slice(2, -2)}</strong>
                : <span key={i}>{part}</span>
        );
    };

    return (
        <div
            className={`flex gap-2 ${isBot ? 'justify-start' : 'justify-end'}`}
            style={animate ? {
                animation: 'bubbleIn 0.35s cubic-bezier(0.22,1,0.36,1) both'
            } : {}}
        >
            {isBot && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md">
                    <Bot className="w-3.5 h-3.5 text-white" />
                </div>
            )}
            <div className={`max-w-[82%] ${isBot ? '' : 'items-end flex flex-col'}`}>
                <div className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isBot
                        ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-sm'
                        : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-tr-sm'
                }`}>
                    {msg.role === 'loading' ? (
                        <div className="flex gap-1 items-center py-0.5">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    ) : (
                        <p className="whitespace-pre-wrap">{renderContent(msg.content)}</p>
                    )}
                </div>
                {msg.time && (
                    <span className="text-[10px] text-gray-400 mt-0.5 px-1">{formatTime(msg.time)}</span>
                )}
            </div>
        </div>
    );
}

export default function NutriBot() {
    const [open, setOpen]         = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [minimized, setMin]     = useState(false);
    const [messages, setMessages] = useState([WELCOME]);
    const [input, setInput]       = useState('');
    const [loading, setLoading]   = useState(false);
    const bottomRef = useRef(null);
    const inputRef  = useRef(null);

    // Auto scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    function closeBot() {
        setIsClosing(true);
        setTimeout(() => {
            setOpen(false);
            setIsClosing(false);
            setMin(false);
        }, 350); // match slideDownPanel duration
    }

    // Focus input when opened
    useEffect(() => {
        if (open && !minimized) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [open, minimized]);

    async function sendMessage(text) {
        const userText = (text ?? input).trim();
        if (!userText || loading) return;

        const userMsg  = { role: 'user', content: userText, time: new Date() };
        const loadMsg  = { role: 'loading', content: '...', time: null };

        setMessages(prev => [...prev, userMsg, loadMsg]);
        setInput('');
        setLoading(true);

        // Build history (exclude loading / welcome)
        const history = [...messages, userMsg]
            .filter(m => m.role === 'user' || m.role === 'assistant')
            .slice(-10)  // keep last 10
            .map(m => ({ role: m.role, content: m.content }));

        try {
            const res = await axios.post('/nutribot/chat', { messages: history }, {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
                },
            });

            const botMsg = { role: 'assistant', content: res.data.reply, time: new Date() };
            setMessages(prev => [...prev.filter(m => m.role !== 'loading'), botMsg]);
        } catch {
            const errMsg = { role: 'assistant', content: 'Maaf, saya sedang sibuk. Coba lagi sebentar ya! 🙏', time: new Date() };
            setMessages(prev => [...prev.filter(m => m.role !== 'loading'), errMsg]);
        } finally {
            setLoading(false);
        }
    }

    function handleKey(e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    }

    const showChips = messages.length <= 1;

    return (
        <>
            {/* Floating button */}
            {!open && (
                <button
                    id="nutribot-fab"
                    onClick={() => { setOpen(true); setMin(false); }}
                    className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 group flex items-center gap-2.5 pl-2.5 pr-4 py-2 rounded-full
                               bg-gradient-to-r from-emerald-500 to-teal-600
                               shadow-lg shadow-emerald-500/40 hover:shadow-emerald-500/60
                               hover:scale-105 active:scale-95 transition-all duration-300"
                    aria-label="Buka NutriBot"
                >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div className="text-left whitespace-nowrap">
                        <p className="text-sm font-bold text-white leading-none">NutriBot</p>
                        <p className="text-[10px] text-emerald-100 mt-0.5">Tanya saya sesuatu!</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse ml-1 flex-shrink-0" />
                </button>
            )}

            {/* Chat window */}
            {(open || isClosing) && (
                <div
                    className={`fixed bottom-6 right-6 z-50 w-[360px] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl shadow-black/20 flex flex-col overflow-hidden transition-all duration-500 ${minimized ? 'h-16' : 'h-[520px]'}`}
                    style={{ animation: isClosing ? 'slideDownPanel 0.35s cubic-bezier(0.22,1,0.36,1) both' : 'slideUpPanel 0.45s cubic-bezier(0.22,1,0.36,1) both' }}
                >

                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 flex-shrink-0">
                        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4.5 h-4.5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-white text-sm">NutriBot</p>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                                <span className="text-[11px] text-emerald-100">Online</span>
                            </div>
                        </div>
                        <button onClick={() => setMin(v => !v)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 hover:scale-110 active:scale-95 rounded-lg transition-all duration-300">
                            <Minus className="w-4 h-4" />
                        </button>
                        <button onClick={() => closeBot()} className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 hover:scale-110 active:scale-95 rounded-lg transition-all duration-300 hover:rotate-90">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Body */}
                    {!minimized && (
                        <>
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50 dark:bg-gray-950">
                                {messages.map((msg, i) => (
                                    <MessageBubble key={i} msg={msg} animate={i === messages.length - 1} />
                                ))}
                                {/* Quick chips on first message */}
                                {showChips && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {QUICK_CHIPS.map(chip => (
                                            <button
                                                key={chip.label}
                                                onClick={() => sendMessage(chip.text)}
                                                disabled={loading}
                                                className="text-xs px-2.5 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                                                           text-gray-700 dark:text-gray-300 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400
                                                           transition-colors shadow-sm disabled:opacity-50"
                                            >
                                                {chip.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <div ref={bottomRef} />
                            </div>

                            {/* Input */}
                            <div className="flex items-center gap-2 px-3 py-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
                                <input
                                    ref={inputRef}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={handleKey}
                                    placeholder="Tanya disini..."
                                    disabled={loading}
                                    className="flex-1 px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800
                                               text-gray-900 dark:text-white placeholder-gray-400
                                               focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                                               disabled:opacity-50 transition-all"
                                />
                                <button
                                    id="nutribot-send"
                                    onClick={() => sendMessage()}
                                    disabled={!input.trim() || loading}
                                    className="w-9 h-9 flex-shrink-0 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white
                                               flex items-center justify-center shadow-md shadow-emerald-500/30
                                               hover:shadow-emerald-500/50 hover:scale-105 active:scale-95
                                               transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
}
