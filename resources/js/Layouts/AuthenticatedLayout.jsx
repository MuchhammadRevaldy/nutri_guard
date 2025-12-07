import { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link } from '@inertiajs/react';
import ThemeToggle from '@/Components/ThemeToggle';

export default function Authenticated({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* 1. Logo (Left) */}
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1 2H8l-1-2H5V5z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">NutriGuard</span>
                            </Link>
                        </div>

                        {/* 2. Centered Navigation */}
                        <div className="hidden space-x-8 sm:flex sm:items-center">
                            <NavLink href={route('dashboard')} active={route().current('dashboard')} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                                Dashboard
                            </NavLink>
                            <NavLink href="#" active={false} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                                Meal Planner
                            </NavLink>
                            <NavLink href="#" active={true} className="text-emerald-500 font-bold border-none">
                                FitChef AI
                            </NavLink>
                            <NavLink href="#" active={false} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                                Community
                            </NavLink>
                        </div>

                        {/* 3. Right Side (Button + Avatar) */}
                        <div className="hidden sm:flex sm:items-center sm:ms-6 gap-4">

                            {/* Theme Toggle */}
                            <ThemeToggle />

                            {/* User Avatar & Dropdown */}
                            <div className="ms-3 relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button type="button" className="flex items-center focus:outline-none transition-transform hover:scale-105">
                                            <span className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {user.name.split(' ')[0]}
                                            </span>
                                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm">
                                                {/* Placeholder Avatar Face */}
                                                <span role="img" aria-label="avatar" className="text-2xl">👨🏻‍🦱</span>
                                            </div>
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <div className="px-4 py-2 text-xs text-gray-400">
                                            {user.name}
                                        </div>
                                        <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Mobile Menu Button (Hamburger) */}
                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 focus:outline-none transition duration-150 ease-in-out"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu (Responsive) */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="pt-2 pb-3 space-y-1">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href="#">Meal Planner</ResponsiveNavLink>
                        <ResponsiveNavLink href="#" className="text-emerald-500">FitChef AI</ResponsiveNavLink>
                        <ResponsiveNavLink href="#">Community</ResponsiveNavLink>
                    </div>

                    <div className="pt-4 pb-1 border-t border-gray-200 dark:border-gray-600">
                        <div className="px-4">
                            <div className="font-medium text-base text-gray-800 dark:text-gray-200">{user.name}</div>
                            <div className="font-medium text-sm text-gray-500">{user.email}</div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white dark:bg-gray-800 shadow">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{header}</div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
