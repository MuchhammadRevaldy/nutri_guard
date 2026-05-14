import { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import { Send, MessageCircle } from 'lucide-react';

export default function ChatIndex({ auth, contacts }) {
    const [localContacts, setLocalContacts] = useState(contacts);
    const [selected,  setSelected]  = useState(null);
    const [messages,  setMessages]  = useState([]);
    const [input,     setInput]     = useState('');
    const [sending,   setSending]   = useState(false);
    const bottomRef  = useRef(null);
    const pollRef    = useRef(null);

    useEffect(() => {
        setLocalContacts(contacts);
    }, [contacts]);

    async function loadMessages(userId) {
        try {
            const res = await axios.get(route('chat.show', userId));
            setMessages(res.data);
            await axios.post(route('chat.markRead', userId));
        } catch {}
    }

    function selectUser(contact) {
        setSelected(contact);
        loadMessages(contact.id);
        
        // Reset unread locally instantly
        setLocalContacts(prev => prev.map(c => 
            c.id === contact.id ? { ...c, unread_count: 0 } : c
        ));
        
        if (auth.user && contact.unread_count > 0) {
            auth.user.unreadMessagesCount = Math.max(0, auth.user.unreadMessagesCount - contact.unread_count);
            // This relies on inertia updating the layout
        }

        clearInterval(pollRef.current);
        pollRef.current = setInterval(() => loadMessages(contact.id), 3000);
    }

    async function sendMessage(e) {
        e.preventDefault();
        if (!input.trim() || !selected || sending) return;
        setSending(true);
        try {
            await axios.post(route('chat.store'), { recipient_id: selected.id, message: input.trim() });
            setInput('');
            await loadMessages(selected.id);
        } catch {}
        setSending(false);
    }

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => () => clearInterval(pollRef.current), []);

    function formatTime(dateStr) {
        return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }

    function formatDate(dateStr) {
        const d = new Date(dateStr);
        const today = new Date();
        if (d.toDateString() === today.toDateString()) return 'Hari ini';
        const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
        if (d.toDateString() === yesterday.toDateString()) return 'Kemarin';
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });
    }

    // Group messages by date
    const grouped = messages.reduce((acc, msg) => {
        const key = new Date(msg.created_at).toDateString();
        if (!acc[key]) acc[key] = [];
        acc[key].push(msg);
        return acc;
    }, {});

    return (
        <AuthenticatedLayout user={auth.user} header="Family Chat">
            <Head title="Family Chat" />
            <div className="flex h-[calc(100vh-4rem)] overflow-hidden">

                {/* Contact list */}
                <aside className={`w-full sm:w-72 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col ${selected ? 'hidden sm:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-emerald-500" />
                            <span className="font-semibold text-sm text-gray-900 dark:text-white">Anggota Keluarga</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {contacts.length === 0 ? (
                            <div className="p-6 text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada kontak. Undang anggota keluarga terlebih dahulu.</p>
                            </div>
                        ) : localContacts.map(c => (
                            <button key={c.id} onClick={() => selectUser(c)}
                                className={`w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${selected?.id === c.id ? 'bg-emerald-50 dark:bg-emerald-900/20 border-r-2 border-emerald-500' : ''}`}>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center overflow-hidden text-white font-bold text-sm flex-shrink-0 ring-1 ring-emerald-500/20">
                                    {c.avatar_url ? <img src={c.avatar_url} alt="avatar" className="w-full h-full object-cover" /> : c.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{c.name}</span>
                                        {c.unread_count > 0 && (
                                            <span className="ml-2 flex-shrink-0 w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                                {c.unread_count}
                                            </span>
                                        )}
                                    </div>
                                    {c.last_message && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{c.last_message}</p>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Chat area */}
                <div className={`flex-1 flex flex-col ${!selected ? 'hidden sm:flex' : 'flex'}`}>
                    {!selected ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-4">
                                <MessageCircle className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Mulai Percakapan</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Pilih anggota keluarga untuk mulai chat</p>
                        </div>
                    ) : (
                        <>
                            {/* Chat header */}
                            <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
                                <button onClick={() => setSelected(null)} className="sm:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center overflow-hidden text-white font-bold text-sm">
                                    {selected.avatar_url ? <img src={selected.avatar_url} alt="avatar" className="w-full h-full object-cover" /> : selected.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-semibold text-sm text-gray-900 dark:text-white">{selected.name}</div>
                                    <div className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Online</span>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
                                {messages.length === 0 && (
                                    <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                                        Mulai percakapan dengan {selected.name}
                                    </div>
                                )}
                                {Object.entries(grouped).map(([dateKey, msgs]) => (
                                    <div key={dateKey}>
                                        <div className="flex items-center gap-3 my-4">
                                            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                                            <span className="text-xs text-gray-400 dark:text-gray-500 px-2">{formatDate(msgs[0].created_at)}</span>
                                            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                                        </div>
                                        {msgs.map(msg => {
                                            const isSelf = msg.sender_id === auth.user.id;
                                            return (
                                                <div key={msg.id} className={`flex mb-2 ${isSelf ? 'justify-end' : 'justify-start'}`}>
                                                    {!isSelf && (
                                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center overflow-hidden text-white text-xs font-bold mr-2 flex-shrink-0 self-end">
                                                            {selected.avatar_url ? <img src={selected.avatar_url} alt="avatar" className="w-full h-full object-cover" /> : selected.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className={`max-w-xs lg:max-w-md ${isSelf ? 'items-end' : 'items-start'} flex flex-col`}>
                                                        <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                                                            isSelf
                                                                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-br-sm'
                                                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 rounded-bl-sm'
                                                        }`}>
                                                            {msg.message}
                                                        </div>
                                                        <span className="text-[10px] text-gray-400 mt-1 px-1">{formatTime(msg.created_at)}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                                <div ref={bottomRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={sendMessage} className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder={`Pesan ke ${selected.name}...`}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-400"
                                />
                                <button type="submit" disabled={!input.trim() || sending}
                                    className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-50 transition-all">
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
