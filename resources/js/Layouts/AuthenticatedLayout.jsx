import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Home, CalendarDays, BarChart3, Settings as SettingsIcon, LogOut as LogOutIcon, Scan, ChefHat } from 'lucide-react';
import ThemeToggle from '@/Components/ThemeToggle';
import Modal from '@/Components/Modal';

export default function Authenticated({ user, header, children, headerActions }) {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    return (
        <div className="min-h-screen h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
            <aside className="fixed inset-y-0 left-0 w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col justify-between overflow-y-auto">
                <div>
                    <Link href={route('profile.edit')} className="p-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm">
                            <span role="img" aria-label="avatar" className="text-2xl">👨🏻‍🦱</span>
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white">Hi, {user.name.split(' ')[0]}!</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Welcome back</div>
                        </div>
                    </Link>
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
            <div className="ml-64 h-screen flex flex-col overflow-y-auto">
                {header && (
                    <header className="bg-white dark:bg-gray-800 shadow">
                        <div className="w-full py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                            <div>{header}</div>
                            <div className="flex items-center gap-3">
                                {headerActions}
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
