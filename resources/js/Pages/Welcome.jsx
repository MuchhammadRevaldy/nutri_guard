import { Link, Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ThemeToggle from '@/Components/ThemeToggle';
import PrimaryButton from '@/Components/PrimaryButton';
import heroImage from '@/images/hero.png';
import logo from '@/images/logo-nutri-copy.png';

export default function Welcome({ auth }) {
    const [activeSection, setActiveSection] = useState('features');

    useEffect(() => {
        const ids = ['features', 'about'];
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) setActiveSection(entry.target.id);
                });
            },
            { threshold: 0.2, rootMargin: '0px 0px -60% 0px' }
        );
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, []);
    return (
        <>
            <Head title="Welcome to NutriGuard" />

            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <nav className="border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            <div className="flex items-center">
                                <Link href="/" className="flex items-center gap-2">
                                    <img src={logo} className="w-8 h-8 rounded-lg" alt="NutriGuard Logo" />
                                    <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">NutriGuard</span>
                                </Link>
                            </div>

                            <div className="hidden md:flex space-x-8">
                                {['Features', 'About'].map((item) => {
                                    const id = item.toLowerCase();
                                    const active = activeSection === id;
                                    return (
                                        <a
                                            key={item}
                                            href={`#${id}`}
                                            className={`inline-block pb-1 text-sm font-medium border-b-2 transition-colors ${active
                                                    ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500'
                                                    : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-emerald-500 dark:hover:text-emerald-400'
                                                }`}
                                        >
                                            {item}
                                        </a>
                                    );
                                })}
                            </div>

                            <div className="flex items-center space-x-4">
                                {auth.user ? (
                                    <>
                                        <Link href={route('dashboard')}>
                                            <PrimaryButton>Dashboard</PrimaryButton>
                                        </Link>
                                        <ThemeToggle />
                                    </>
                                ) : (
                                    <>
                                        <Link href={route('login')} className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                                            Log in
                                        </Link>
                                        <Link href={route('register')}>
                                            <PrimaryButton>Get Started</PrimaryButton>
                                        </Link>
                                        <ThemeToggle />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="text-center lg:text-left">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                                AI-Powered <br className="hidden lg:block" />
                                Nutrition for <br className="hidden lg:block" />
                                <span className="text-emerald-500">Families</span>
                            </h1>
                            <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0">
                                Scan food, generate personalized recipes, and monitor your family's nutritional intake to prevent health risks like stunting.
                            </p>

                            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link href={route('register')}>
                                    <PrimaryButton className="w-full sm:w-auto px-8 py-4 text-base">
                                        Start Now
                                    </PrimaryButton>
                                </Link>
                                <button className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-sm text-white bg-orange-500 hover:bg-orange-600 focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-900 transition-all shadow-lg shadow-orange-500/30">
                                    Learn More
                                </button>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                            <img
                                src={heroImage}
                                alt="Family nutrition illustration"
                                className="relative rounded-2xl shadow-2xl dark:shadow-emerald-900/20 transform hover:scale-102 transition-transform duration-500"
                            />
                        </div>
                    </div>
                </main>

                <section id="features" className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                                A new way to manage family health
                            </h2>
                            <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">
                                Our AI-powered tools make understanding and improving your family's nutrition simple and effective.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
                                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">NutriScan AI</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Instantly analyze food items by scanning them with your camera to understand their nutritional value in real-time.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
                                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">FitChef AI</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Generate personalized and healthy recipes based on your family's dietary needs and ingredients you have at home.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
                                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Family Dashboard</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Track and monitor the nutritional intake and growth progress of all family members in one centralized place.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="about" className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">About NutriGuard</h2>
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                                An AI-powered companion that helps families scan meals, create healthier recipes,
                                and track daily nutrition with clear weekly insights.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">What it does</div>
                                <ul className="mt-4 space-y-3 text-gray-600 dark:text-gray-300">
                                    <li><span className="font-semibold text-gray-900 dark:text-white">NutriScan</span>: scan meals to estimate calories and nutrients.</li>
                                    <li><span className="font-semibold text-gray-900 dark:text-white">FitChef</span>: generate personalized, healthy recipes.</li>
                                    <li><span className="font-semibold text-gray-900 dark:text-white">Family Dashboard</span>: monitor daily targets and progress.</li>
                                    <li><span className="font-semibold text-gray-900 dark:text-white">Reports & Insights</span>: review trends and export PDFs.</li>
                                </ul>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">Why we built it</div>
                                <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                                    We want to make healthy eating practical for families by unifying scanning,
                                    recipe generation, daily monitoring, and actionable reports.
                                </p>
                                <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-300">
                                    <li>Centralize nutrition tracking for the whole family.</li>
                                    <li>Make healthy cooking easier with AI suggestions.</li>
                                    <li>Turn daily data into clear, shareable insights.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-3">
                                    <img src={logo} className="w-9 h-9 rounded-lg" alt="NutriGuard Logo" />
                                    <span className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">NutriGuard</span>
                                </div>
                                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
                                    AI-powered nutrition companion to help families scan meals, craft healthier recipes, and track daily intake.
                                </p>
                            </div>

                            <div>
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">Explore</div>
                                <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    <li><a href="#features" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Features</a></li>
                                    <li><a href="#about" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">About</a></li>
                                </ul>
                            </div>

                            <div>
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">Products</div>
                                <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    <li>NutriScan AI</li>
                                    <li>FitChef AI</li>
                                    <li>Family Dashboard</li>
                                </ul>
                            </div>

                            <div>
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">Account</div>
                                <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    {auth.user ? (
                                        <li>
                                            <Link href={route('dashboard')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Dashboard</Link>
                                        </li>
                                    ) : (
                                        <>
                                            <li>
                                                <Link href={route('login')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Log in</Link>
                                            </li>
                                            <li>
                                                <Link href={route('register')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Get Started</Link>
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">&copy; 2025 NutriGuard. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
