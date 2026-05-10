import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Home, Scan, ChefHat, CalendarDays, BarChart3, MessageCircle, Settings, LogOut } from 'lucide-react';
import ThemeToggle from '@/Components/ThemeToggle';
import Modal from '@/Components/Modal';
import logo from '@/images/logo-nutri-copy.png';

const navItems = [
    { label: 'Dashboard',    href: 'dashboard',      icon: Home,         exact: true },
    { label: 'NutriScan',    href: 'nutriscan.index', icon: Scan,         exact: true },
    { label: 'FitChef',      href: 'fitchef.index',   icon: ChefHat,      exact: true },
    { label: 'Meal Planner', href: 'meal-planner',    icon: CalendarDays, exact: true },
    { label: 'Laporan',      href: 'report',          icon: BarChart3,    exact: true },
    { label: 'Family Chat',  href: 'chat.index',      icon: MessageCircle,exact: true, badge: true },
    { label: 'Pengaturan',   href: 'profile.edit',    icon: Settings,     exact: true },
];

export default function Authenticated({ user, header, children, headerActions }) {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    function isActive(item) {
        try { return route().current(item.href); } catch { return false; }
    }

    return (
        <div className="min-h-screen h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden flex">

            {/* Mobile overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/60 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-64 flex flex-col bg-gray-900 transform transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* Logo */}
                <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10 flex-shrink-0">
                    <img src={logo} alt="NutriGuard" className="w-8 h-8 rounded-lg" />
                    <span className="font-bold text-lg text-white tracking-tight">NutriGuard</span>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="ml-auto p-1 text-gray-400 hover:text-white md:hidden">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* User profile */}
                <Link href={route('profile.edit')} className="flex items-center gap-3 px-5 py-4 border-b border-white/10 hover:bg-white/5 transition-colors flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-emerald-500/30">
                        {user.avatar ? (
                            <img src={`/storage/${user.avatar}`} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-white font-bold text-sm">{user.name.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-semibold text-white truncate">{user.name.split(' ')[0]}</div>
                        <div className="text-xs text-gray-400 truncate">{user.email}</div>
                    </div>
                </Link>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const active = isActive(item);
                        const Icon   = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={route(item.href)}
                                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    active
                                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/20'
                                        : 'text-gray-400 hover:text-white hover:bg-white/8'
                                }`}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                <span>{item.label}</span>
                                {item.badge && user.unreadMessagesCount > 0 && (
                                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                        {user.unreadMessagesCount}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="px-3 py-4 border-t border-white/10 flex-shrink-0">
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Keluar</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <div className="flex-1 md:ml-64 h-screen flex flex-col overflow-hidden">

                {/* Top header */}
                <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10 flex-shrink-0">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            {header && <div className="font-semibold text-gray-900 dark:text-white">{header}</div>}
                        </div>

                        <div className="flex items-center gap-2">
                            {headerActions}
                            <Link
                                href={route('invitations.index')}
                                className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {user && (user.pendingInvitationsCount > 0 || user.unreadMessagesCount > 0) && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                        {(user.pendingInvitationsCount || 0) + (user.unreadMessagesCount || 0)}
                                    </span>
                                )}
                            </Link>
                            <ThemeToggle />
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>

            {/* Logout confirm modal */}
            <Modal show={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} maxWidth="sm">
                <div className="p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                        <LogOut className="w-7 h-7 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Konfirmasi Keluar</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Apakah kamu yakin ingin keluar dari sesi ini?</p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowLogoutConfirm(false)}
                            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={() => router.post(route('logout'))}
                            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-red-600 hover:bg-red-700 text-white transition-colors"
                        >
                            Keluar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
