import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import ThemeToggle from '@/Components/ThemeToggle';
import logo from '@/images/logo-nutri-copy.png';

const NAV_LINKS = [
    { href: '/',             label: 'Home' },
    { href: '/artikel',      label: 'Artikel' },
    { href: '/tentang',      label: 'Tentang' },
    { href: '/hubungi-kami', label: 'Hubungi Kami' },
];

export default function PublicNavbar({ auth, active }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="border-b border-gray-200/50 dark:border-gray-800/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl sticky top-0 z-50 shadow-sm relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
                <Link href="/" className="flex items-center gap-2">
                    <img src={logo} className="w-8 h-8 rounded-lg" alt="NutriGuard" />
                    <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">NutriGuard</span>
                </Link>

                <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                    {NAV_LINKS.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`pb-0.5 border-b-2 transition-colors ${
                                active === label
                                    ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500'
                                    : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-emerald-600 dark:hover:text-emerald-400'
                            }`}
                        >
                            {label}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {auth?.user ? (
                        <Link href={route('dashboard')} className="hidden sm:inline-flex px-4 py-2 bg-emerald-500/50 backdrop-blur-md border border-emerald-400/50 hover:bg-emerald-400/60 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-500/20 transition-all">
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link href={route('login')} className="hidden sm:inline-block text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                                Masuk
                            </Link>
                            <Link href={route('register')} className="hidden sm:inline-flex px-4 py-2 bg-emerald-500/50 backdrop-blur-md border border-emerald-400/50 hover:bg-emerald-400/60 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-500/20 transition-all">
                                Daftar Gratis
                            </Link>
                        </>
                    )}
                    <ThemeToggle />
                    
                    {/* Mobile Menu Button */}
                    <button 
                        className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* MOBILE MENU */}
            <div className={`md:hidden absolute top-[64px] left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-[24rem] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-4 pt-2 pb-6 space-y-1">
                    {NAV_LINKS.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
                                active === label
                                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                                    : 'text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                        >
                            {label}
                        </Link>
                    ))}
                    
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-3 sm:hidden">
                        {auth?.user ? (
                            <Link href={route('dashboard')} className="w-full text-center px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-base font-semibold rounded-xl shadow-md transition-all">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="w-full text-center py-2.5 px-4 rounded-xl text-base font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors">
                                    Masuk
                                </Link>
                                <Link href={route('register')} className="w-full text-center px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-base font-semibold rounded-xl shadow-md transition-all">
                                    Daftar Gratis
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
