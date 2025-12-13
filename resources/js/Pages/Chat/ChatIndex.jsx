import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function ChatIndex({ auth, contacts }) {
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef(null);
    const pollInterval = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const selectUser = async (user) => {
        // Mark as read immediately when selecting
        if (user.unread_count > 0) {
            try {
                await axios.post(route('chat.markRead', user.id));
                // Update local state and global props
                user.unread_count = 0;
                router.reload({ only: ['auth', 'contacts'] });
            } catch (e) {
                console.error("Failed to mark read", e);
            }
        }

        setSelectedUser(user);
        setMessages([]);
        loadMessages(user.id);

        // Start polling
        if (pollInterval.current) clearInterval(pollInterval.current);
        pollInterval.current = setInterval(() => loadMessages(user.id), 3000);
    };

    const loadMessages = async (userId) => {
        try {
            const response = await axios.get(route('chat.show', userId));
            setMessages(response.data);
        } catch (error) {
            console.error("Failed to load messages", error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || !selectedUser) return;

        const msg = inputMessage;
        setInputMessage(''); // Optimistic clear

        try {
            await axios.post(route('chat.store'), {
                recipient_id: selectedUser.id,
                message: msg
            });
            loadMessages(selectedUser.id);
        } catch (error) {
            console.error("Failed to send", error);
        }
    };

    // Cleanup polling
    useEffect(() => {
        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Family Chat</h2>}
        >
            <Head title="Family Chat" />

            {/* FULL SCREEN CONTAINER: removed py-6, added h-[calc(100vh-80px)] to fit tight space below header */}
            <div className="h-[calc(100vh-85px)] w-full">
                <div className="max-w-7xl mx-auto h-full flex bg-white dark:bg-gray-800 border-x border-gray-200 dark:border-gray-700 shadow-sm">

                    {/* Sidebar: Contacts */}
                    <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                            <h3 className="font-bold text-gray-700 dark:text-gray-300">Family Members</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {contacts.length === 0 ? (
                                <div className="p-4 text-gray-500 text-center text-sm">No family members found.</div>
                            ) : (
                                contacts.map(contact => (
                                    <button
                                        key={contact.id}
                                        onClick={() => selectUser(contact)}
                                        className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left border-b border-gray-100 dark:border-gray-700 ${selectedUser?.id === contact.id ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''
                                            }`}
                                    >
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-xl border border-gray-200">
                                                {contact.name.charAt(0)}
                                            </div>
                                            {contact.unread_count > 0 && (
                                                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-white">
                                                    {contact.unread_count}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="font-medium text-gray-900 dark:text-white truncate">{contact.name}</div>
                                            </div>
                                            <div className={`text-xs truncate ${contact.unread_count > 0 ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                                                {contact.last_message ? (
                                                    <span>{contact.last_message.sender_id === auth.user.id ? 'You: ' : ''}{contact.last_message.message}</span>
                                                ) : (
                                                    <span className="italic">Start a conversation</span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Main Chat Area */}
                    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
                        {selectedUser ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-3 shadow-sm">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-lg">
                                        {selectedUser.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white">{selectedUser.name}</div>
                                        <div className="text-xs text-emerald-500 flex items-center gap-1">
                                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Online
                                        </div>
                                    </div>
                                </div>

                                {/* Messages List */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messages.length === 0 && (
                                        <div className="text-center text-gray-400 mt-10">
                                            <p>Say hello to {selectedUser.name}!</p>
                                        </div>
                                    )}
                                    {messages.map((msg) => {
                                        const isMe = msg.sender_id === auth.user.id;
                                        return (
                                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${isMe
                                                    ? 'bg-emerald-500 text-white rounded-br-none'
                                                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-gray-700'
                                                    }`}>
                                                    <p className="text-sm">{msg.message}</p>
                                                    <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-emerald-100' : 'text-gray-400'}`}>
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                                    <form onSubmit={sendMessage} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={inputMessage}
                                            onChange={(e) => setInputMessage(e.target.value)}
                                            placeholder="Type a message..."
                                            className="flex-1 rounded-full border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!inputMessage.trim()}
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <svg className="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <p className="text-lg font-medium">Select a family member to chat</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
