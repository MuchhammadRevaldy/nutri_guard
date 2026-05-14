import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Home, CalendarDays, BarChart3, Settings as SettingsIcon, LogOut as LogOutIcon, Scan, ChefHat } from 'lucide-react';
import ThemeToggle from '@/Components/ThemeToggle';
import Modal from '@/Components/Modal';

export default function Authenticated({ user, header, children, headerActions }) {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    return (
        <div className="min-h-screen h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col justify-between overflow-y-auto transform transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div>
                    <div className="flex items-center justify-between p-4 md:p-6">
                        <Link href={route('profile.edit')} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm">
                                {user.avatar ? (
                                    <img src={`/storage/${user.avatar}`} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span role="img" aria-label="avatar" className="text-2xl">👨🏻‍🦱</span>
                                )}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-900 dark:text-white">Hi, {user.name.split(' ')[0]}!</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Welcome back</div>
                            </div>
                        </Link>
                        {/* Close button for mobile */}
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="px-3 space-y-1">
                        <Link href={route('dashboard')} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${route().current('dashboard') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                            <Home className="w-5 h-5" />
                            <span className="font-medium text-sm">Dashboard</span>
                        </Link>
                        <Link href={route('nutriscan.index')} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${route().current('nutriscan.index') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                            <Scan className="w-5 h-5" />
                            <span className="font-medium text-sm">NutriScan</span>
                        </Link>
                        <Link href="/fitchef" className={`flex items-center gap-3 px-3 py-2 rounded-lg ${window.location.pathname.startsWith('/fitchef') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                            <ChefHat className="w-5 h-5" />
                            <span className="font-medium text-sm">FitChef</span>
                        </Link>
                        <Link href="/meal-planner" className={`flex items-center gap-3 px-3 py-2 rounded-lg ${window.location.pathname === '/meal-planner' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                            <CalendarDays className="w-5 h-5" />
                            <span className="font-medium text-sm">Meal Planner</span>
                        </Link>
                        <Link href={route('report')} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${route().current('report') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                            <BarChart3 className="w-5 h-5" />
                            <span className="font-medium text-sm">Progress</span>
                        </Link>
                        <Link href={route('chat.index')} className={`relative flex items-center gap-3 px-3 py-2 rounded-lg ${route().current('chat.index') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="font-medium text-sm">Family Chat</span>
                            {user.unreadMessagesCount > 0 && (
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    {user.unreadMessagesCount}
                                </span>
                            )}
                        </Link>
                        <Link href={route('profile.edit')} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${route().current('profile.edit') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                            <SettingsIcon className="w-5 h-5" />
                            <span className="font-medium text-sm">Profil Seting</span>
                        </Link>
                    </div>
                </div>
                <div className="p-4 space-y-3">
                    <button
                        type="button"
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <LogOutIcon className="w-5 h-5" />
                        <span className="font-medium text-sm">Logout</span>
                    </button>
                </div>
            </aside>
            <div className="md:ml-64 h-screen flex flex-col overflow-y-auto">
                {header && (
                    <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-10">
                        <div className="w-full py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {/* Hamburger Button */}
                                <button
                                    onClick={() => setIsMobileMenuOpen(true)}
                                    className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                                <div>{header}</div>
                            </div>
                            <div className="flex items-center gap-3">
                                {headerActions}
                                {/* Notification Icon */}
                                <Link href={route('invitations.index')} className="relative p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <span className="sr-only">View notifications</span>
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    {/* Badge */}
                                    {user && (user.pendingInvitationsCount > 0 || user.unreadMessagesCount > 0) && (
                                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-800">
                                            {(user.pendingInvitationsCount || 0) + (user.unreadMessagesCount || 0)}
                                        </span>
                                    )}
                                </Link>
                                <ThemeToggle />
                            </div>
                        </div>
                    </header>
                )}
                <main className="w-full px-4 sm:px-6 lg:px-8">{children}</main>
            </div>
            <Modal show={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} maxWidth="sm">
                <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                        <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Konfirmasi Logout</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Anda akan keluar dari sesi. Lanjutkan?</p>
                    <div className="space-y-3">
                        <button
                            onClick={() => router.post(route('logout'))}
                            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                        >
                            Logout
                        </button>
                        <button
                            onClick={() => setShowLogoutConfirm(false)}
                            className="w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold rounded-lg transition-colors"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
