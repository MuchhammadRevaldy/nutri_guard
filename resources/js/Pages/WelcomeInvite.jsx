import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function WelcomeInvite({ auth, invitations, unreadChats = [] }) {
    const hasNotifications = invitations.length > 0 || unreadChats.length > 0;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Notifications</h2>}
        >
            <Head title="Notifications" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* Welcome Card */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
                        <h1 className="text-2xl font-bold mb-2">Welcome Back, {auth.user.name.split(' ')[0]}! 👋</h1>
                        <p className="opacity-90">Here are your latest updates and notifications.</p>
                    </div>

                    {/* Empty State */}
                    {!hasNotifications && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No new notifications</h3>
                            <p className="text-gray-500 text-sm mb-6">You're all caught up!</p>
                            <Link href={route('dashboard')} className="px-6 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-full font-medium hover:opacity-90 transition-opacity">
                                Go to Dashboard
                            </Link>
                        </div>
                    )}

                    {/* Chat Notifications */}
                    {unreadChats.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 px-1">Unread Messages</h3>
                            {unreadChats.map((chat, idx) => (
                                <Link href={route('chat.index')} key={idx} className="block group">
                                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 transition-transform transform hover:scale-[1.01]">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
                                                {chat.sender?.name.charAt(0)}
                                            </div>
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-white">
                                                {chat.count}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-gray-900 dark:text-white">{chat.sender?.name}</h4>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(chat.latest_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 truncate font-medium">
                                                {chat.latest_message.message}
                                            </p>
                                        </div>
                                        <div className="text-gray-400 group-hover:text-emerald-500 transition-colors">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Invitations */}
                    {invitations.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 px-1">Family Invitations</h3>
                            {invitations.map((invite) => (
                                <div key={invite.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-emerald-100 dark:border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl">
                                            📩
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400">{invite.sender?.name}</span> invited you.
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Invited to join their family circle.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 w-full sm:w-auto">
                                        <a
                                            href={route('family.accept', { token: invite.token })}
                                            className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-center rounded-xl font-bold transition-colors shadow-md shadow-emerald-500/20 text-sm"
                                        >
                                            Accept
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
