import { Link, Head } from '@inertiajs/react';
import { useEffect, useState, useRef, lazy, Suspense } from 'react';
import ThemeToggle from '@/Components/ThemeToggle';
import PrimaryButton from '@/Components/PrimaryButton';
import logo from '@/images/logo-nutri-copy.png';
import RevealOnScroll from '@/Components/RevealOnScroll';
import Hero3DModel from '@/Components/Hero3DModel';

function useCounter(target, duration = 2000, shouldStart) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!shouldStart) return;
        let startTime = null;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [shouldStart, target, duration]);
    return count;
}

const stats = [
    { label: 'Keluarga Terdaftar', value: 500, suffix: '+' },
    { label: 'Makanan Discan', value: 10000, suffix: '+' },
    { label: 'Resep Dibuat', value: 1200, suffix: '+' },
    { label: 'Tingkat Kepuasan', value: 95, suffix: '%' },
];

const features = [
    {
        icon: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        title: 'NutriScan',
        desc: 'Scan makanan dengan kamera dan dapatkan analisis gizi lengkap secara instan. Hemat waktu, hasil akurat.',
        badge: 'Scan & Analisis',
    },
    {
        icon: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        title: 'FitChef',
        desc: 'Generate resep sehat yang dipersonalisasi berdasarkan bahan yang ada di rumah dan kebutuhan gizi keluarga.',
        badge: 'Resep Cerdas',
    },
    {
        icon: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        title: 'Family Dashboard',
        desc: 'Pantau asupan gizi harian dan perkembangan pertumbuhan semua anggota keluarga dalam satu dasbor terpusat.',
        badge: 'Pemantauan Keluarga',
    },
];

const steps = [
    {
        number: '01',
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        title: 'Foto Makanan',
        desc: 'Ambil foto makanan dengan kamera atau upload gambar dari galeri — proses hitungan detik.',
    },
    {
        number: '02',
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
        ),
        title: 'Analisis Gizi',
        desc: 'Sistem mengenali makanan dan menghitung kalori, protein, karbohidrat serta lemak secara otomatis.',
    },
    {
        number: '03',
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        title: 'Pantau Progress',
        desc: 'Lihat grafik tren mingguan, laporan gizi, dan dapatkan notifikasi kesehatan untuk seluruh keluarga.',
    },
];

const testimonials = [
    {
        name: 'Budi Santoso',
        role: 'Ayah, 2 anak',
        quote: 'NutriGuard benar-benar mengubah cara kami memantau gizi anak. Sekarang kami tahu persis apa yang mereka makan setiap hari dan apakah sudah memenuhi kebutuhan nutrisinya.',
        rating: 5,
        initials: 'BS',
        color: 'from-emerald-500 to-teal-600',
    },
    {
        name: 'Siti Rahayu',
        role: 'Ibu Rumah Tangga',
        quote: 'FitChef luar biasa! Saya tinggal input bahan-bahan yang ada di kulkas, dan langsung dapat resep sehat yang bisa dibuat hari itu juga. Sangat praktis untuk keluarga.',
        rating: 5,
        initials: 'SR',
        color: 'from-violet-500 to-purple-600',
    },
    {
        name: 'Dr. Andi Pratama',
        role: 'Dokter Gizi',
        quote: 'Sebagai dokter gizi, saya sangat mengapresiasi akurasi data nutrisi di aplikasi ini. Tool yang tepat untuk membantu keluarga Indonesia mencegah stunting sejak dini.',
        rating: 5,
        initials: 'AP',
        color: 'from-orange-500 to-amber-600',
    },
];

export default function Welcome({ auth }) {
    const [activeSection, setActiveSection] = useState('features');
    const [statsVisible, setStatsVisible] = useState(false);
    const statsRef = useRef(null);

    const c1 = useCounter(stats[0].value, 1800, statsVisible);
    const c2 = useCounter(stats[1].value, 2000, statsVisible);
    const c3 = useCounter(stats[2].value, 1900, statsVisible);
    const c4 = useCounter(stats[3].value, 1500, statsVisible);
    const counters = [c1, c2, c3, c4];

    useEffect(() => {
        const ids = ['features', 'about', 'how-it-works', 'testimonials'];
        const navObserver = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) setActiveSection(entry.target.id);
                });
            },
            { threshold: 0.2, rootMargin: '0px 0px -60% 0px' }
        );
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) navObserver.observe(el);
        });

        const statsObserver = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setStatsVisible(true);
                    statsObserver.disconnect();
                }
            },
            { threshold: 0.3 }
        );
        if (statsRef.current) statsObserver.observe(statsRef.current);

        return () => {
            navObserver.disconnect();
            statsObserver.disconnect();
        };
    }, []);

    return (
        <>
            <Head title="Welcome to NutriGuard" />

            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">

                {/* NAVBAR */}
                <nav className="border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 animate-fade-in-down">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            <Link href="/" className="flex items-center gap-2">
                                <img src={logo} className="w-8 h-8 rounded-lg" alt="NutriGuard Logo" />
                                <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">NutriGuard</span>
                            </Link>

                            <div className="hidden md:flex space-x-8">
                                {[['Fitur', 'features'], ['Cara Kerja', 'how-it-works'], ['Tentang', 'about']].map(([label, id]) => (
                                    <a
                                        key={id}
                                        href={`#${id}`}
                                        className={`inline-block pb-1 text-sm font-medium border-b-2 transition-colors ${activeSection === id
                                            ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500'
                                            : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-emerald-500 dark:hover:text-emerald-400'
                                        }`}
                                    >
                                        {label}
                                    </a>
                                ))}
                            </div>

                            <div className="flex items-center space-x-4">
                                {auth.user ? (
                                    <>
                                        <Link href={route('dashboard')}><PrimaryButton>Dashboard</PrimaryButton></Link>
                                        <ThemeToggle />
                                    </>
                                ) : (
                                    <>
                                        <Link href={route('login')} className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                                            Log in
                                        </Link>
                                        <Link href={route('register')}><PrimaryButton>Mulai Gratis</PrimaryButton></Link>
                                        <ThemeToggle />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* HERO SECTION */}
                <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-gray-950">
                    <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-800/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            {/* Left: text */}
                            <div className="text-center lg:text-left">
                                <RevealOnScroll>
                                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-6">
                                        ✦ Platform Gizi Keluarga
                                    </span>
                                </RevealOnScroll>

                                <RevealOnScroll delay={100}>
                                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
                                        Pantau Gizi <br className="hidden lg:block" />
                                        untuk{' '}
                                        <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                            Keluarga Sehat
                                        </span>
                                    </h1>
                                </RevealOnScroll>

                                <RevealOnScroll delay={200}>
                                    <p className="mt-6 text-lg text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                        Scan makanan, buat resep sehat, dan pantau gizi seluruh anggota keluarga secara real-time dalam satu platform yang mudah digunakan.
                                    </p>
                                </RevealOnScroll>

                                <RevealOnScroll delay={300}>
                                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                        <Link href={route('register')}>
                                            <button className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-sm text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/30 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/40">
                                                Mulai Gratis
                                            </button>
                                        </Link>
                                        <a
                                            href="#how-it-works"
                                            className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-sm text-white border border-white/20 hover:bg-white/10 transition-all duration-300 text-center"
                                        >
                                            Cara Kerja →
                                        </a>
                                    </div>
                                </RevealOnScroll>

                                <RevealOnScroll delay={400}>
                                    <div className="mt-10 flex items-center gap-4 justify-center lg:justify-start">
                                        <div className="flex -space-x-2">
                                            {['BS', 'SR', 'AP'].map((init, i) => (
                                                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-emerald-950 flex items-center justify-center text-white text-xs font-bold">
                                                    {init}
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-sm text-gray-400">
                                            <span className="text-white font-semibold">500+</span> keluarga sudah bergabung
                                        </p>
                                    </div>
                                </RevealOnScroll>
                            </div>

                            {/* Right: 3D Logo Model */}
                            <RevealOnScroll delay={200} className="relative flex items-center justify-center" style={{ minHeight: '460px' }}>
                                <Hero3DModel />
                            </RevealOnScroll>
                        </div>
                    </div>
                </section>

                {/* STATS BAR */}
                <section ref={statsRef} className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            {stats.map((stat, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                                        {counters[i].toLocaleString('id-ID')}{stat.suffix}
                                    </div>
                                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FEATURES SECTION */}
                <section id="features" className="py-24 bg-gray-50 dark:bg-gray-950">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <RevealOnScroll>
                            <div className="text-center max-w-3xl mx-auto mb-16">
                                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 mb-4">
                                    Fitur Utama
                                </span>
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                                    Semua yang Kamu Butuhkan untuk{' '}
                                    <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                                        Gizi Keluarga
                                    </span>
                                </h2>
                                <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">
                                    Tiga fitur terintegrasi untuk membantu keluarga hidup lebih sehat setiap hari.
                                </p>
                            </div>
                        </RevealOnScroll>

                        <div className="grid md:grid-cols-3 gap-8">
                            {features.map((f, i) => (
                                <RevealOnScroll key={i} delay={i * 150} className="h-full">
                                    <div className="group bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                                                {f.icon}
                                            </div>
                                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                                                {f.badge}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{f.title}</h3>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed flex-1">{f.desc}</p>
                                        <div className="mt-6 text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                                            Pelajari lebih <span>→</span>
                                        </div>
                                    </div>
                                </RevealOnScroll>
                            ))}
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section id="how-it-works" className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <RevealOnScroll>
                            <div className="text-center max-w-3xl mx-auto mb-16">
                                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400 mb-4">
                                    Cara Kerja
                                </span>
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                                    Mulai dalam{' '}
                                    <span className="bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                                        3 Langkah Mudah
                                    </span>
                                </h2>
                                <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">
                                    Tidak perlu keahlian khusus — cukup foto, analisis, dan pantau.
                                </p>
                            </div>
                        </RevealOnScroll>

                        <div className="relative">
                            <div className="hidden lg:block absolute h-0.5 bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-300 dark:from-emerald-700 dark:via-cyan-700 dark:to-emerald-700" style={{ top: '3.5rem', left: 'calc(16.66% + 2rem)', right: 'calc(16.66% + 2rem)' }} />

                            <div className="grid md:grid-cols-3 gap-10 relative">
                                {steps.map((step, i) => (
                                    <RevealOnScroll key={i} delay={i * 200}>
                                        <div className="flex flex-col items-center text-center">
                                            <div className="relative mb-6">
                                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
                                                    {step.icon}
                                                </div>
                                                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white dark:bg-gray-900 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-extrabold">
                                                    {step.number}
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs">{step.desc}</p>
                                        </div>
                                    </RevealOnScroll>
                                ))}
                            </div>
                        </div>

                        <RevealOnScroll delay={400}>
                            <div className="mt-14 text-center">
                                <Link href={route('register')}>
                                    <button className="px-8 py-4 rounded-full font-bold text-sm text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/30 transition-all duration-300">
                                        Coba Sekarang — Gratis
                                    </button>
                                </Link>
                            </div>
                        </RevealOnScroll>
                    </div>
                </section>

                {/* TESTIMONIALS */}
                <section id="testimonials" className="py-24 bg-white dark:bg-gray-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <RevealOnScroll>
                            <div className="text-center max-w-3xl mx-auto mb-16">
                                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 mb-4">
                                    Testimoni
                                </span>
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                                    Dipercaya oleh{' '}
                                    <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                                        Keluarga Indonesia
                                    </span>
                                </h2>
                                <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">
                                    Apa kata mereka yang sudah merasakan manfaat NutriGuard.
                                </p>
                            </div>
                        </RevealOnScroll>

                        <div className="grid md:grid-cols-3 gap-8">
                            {testimonials.map((t, i) => (
                                <RevealOnScroll key={i} delay={i * 150}>
                                    <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors duration-300 h-full flex flex-col">
                                        <div className="flex gap-1 mb-4">
                                            {Array.from({ length: t.rating }).map((_, j) => (
                                                <span key={j} className="text-amber-400 text-lg">★</span>
                                            ))}
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed flex-1 italic">
                                            "{t.quote}"
                                        </p>
                                        <div className="mt-6 flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                                                {t.initials}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{t.role}</div>
                                            </div>
                                        </div>
                                    </div>
                                </RevealOnScroll>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ABOUT SECTION */}
                <section id="about" className="py-24 bg-gray-50 dark:bg-gray-950">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <RevealOnScroll>
                            <div className="text-center max-w-3xl mx-auto mb-12">
                                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 mb-4">
                                    Tentang Kami
                                </span>
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                                    Kenapa NutriGuard?
                                </h2>
                                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                                    Misi kami adalah membuat gizi sehat mudah dijangkau dan dipahami oleh setiap keluarga Indonesia.
                                </p>
                            </div>
                        </RevealOnScroll>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <RevealOnScroll delay={100} className="h-full">
                                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 p-8 h-full transition-colors duration-300">
                                    <div className="text-lg font-bold text-gray-900 dark:text-white mb-6">Apa yang Kami Tawarkan</div>
                                    <ul className="space-y-4 text-gray-600 dark:text-gray-300">
                                        {[
                                            ['NutriScan', 'Scan makanan untuk estimasi kalori dan nutrisi akurat.'],
                                            ['FitChef', 'Generate resep sehat yang dipersonalisasi sesuai kebutuhan.'],
                                            ['Family Dashboard', 'Pantau target harian dan perkembangan seluruh keluarga.'],
                                            ['Reports & Insights', 'Tinjau tren mingguan dan export laporan PDF.'],
                                        ].map(([title, desc]) => (
                                            <li key={title} className="flex items-start gap-3">
                                                <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                                                <span><span className="font-semibold text-gray-900 dark:text-white">{title}:</span> {desc}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </RevealOnScroll>

                            <RevealOnScroll delay={200} className="h-full">
                                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 p-8 h-full transition-colors duration-300">
                                    <div className="text-lg font-bold text-gray-900 dark:text-white mb-6">Mengapa Kami Membangunnya</div>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                        Masalah stunting dan gizi buruk masih menjadi tantangan besar bagi keluarga Indonesia. Kami ingin membuat pemantauan gizi lebih mudah, murah, dan efektif untuk semua kalangan.
                                    </p>
                                    <ul className="mt-6 space-y-3 text-gray-600 dark:text-gray-300">
                                        {[
                                            'Sentralisasi pemantauan gizi untuk seluruh keluarga.',
                                            'Membuat memasak sehat lebih mudah dengan resep yang tepat.',
                                            'Mengubah data harian menjadi wawasan yang bisa ditindaklanjuti.',
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </RevealOnScroll>
                        </div>
                    </div>
                </section>

                {/* FINAL CTA BANNER */}
                <section className="py-24 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 relative overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative max-w-4xl mx-auto text-center px-4">
                        <RevealOnScroll>
                            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-white/20 text-white mb-6">
                                Mulai Sekarang — Gratis
                            </span>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                                Jaga Gizi Keluarga <br className="hidden sm:block" />
                                Mulai Hari Ini
                            </h2>
                            <p className="mt-6 text-emerald-100 text-lg max-w-2xl mx-auto">
                                Bergabung bersama 500+ keluarga yang sudah merasakan manfaat pemantauan gizi bersama NutriGuard. Gratis, mudah, dan efektif.
                            </p>
                            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href={route('register')}>
                                    <button className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-sm text-emerald-700 bg-white hover:bg-gray-50 shadow-lg shadow-black/20 transition-all duration-300">
                                        Daftar Gratis Sekarang
                                    </button>
                                </Link>
                                <a
                                    href="#features"
                                    className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-sm text-white border-2 border-white/40 hover:bg-white/10 transition-all duration-300 text-center"
                                >
                                    Lihat Semua Fitur
                                </a>
                            </div>
                        </RevealOnScroll>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="bg-gray-950 border-t border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                            <div className="text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-3">
                                    <img src={logo} className="w-9 h-9 rounded-lg" alt="NutriGuard Logo" />
                                    <span className="font-bold text-lg text-white tracking-tight">NutriGuard</span>
                                </div>
                                <p className="mt-4 text-sm text-gray-500 max-w-xs">
                                    Platform pemantauan gizi keluarga untuk hidup yang lebih sehat setiap harinya.
                                </p>
                            </div>

                            <div>
                                <div className="text-sm font-semibold text-gray-300 mb-4">Jelajahi</div>
                                <ul className="space-y-2 text-sm text-gray-500">
                                    <li><a href="#features" className="hover:text-emerald-400 transition-colors">Fitur</a></li>
                                    <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors">Cara Kerja</a></li>
                                    <li><a href="#about" className="hover:text-emerald-400 transition-colors">Tentang</a></li>
                                </ul>
                            </div>

                            <div>
                                <div className="text-sm font-semibold text-gray-300 mb-4">Produk</div>
                                <ul className="space-y-2 text-sm text-gray-500">
                                    <li>NutriScan</li>
                                    <li>FitChef</li>
                                    <li>Family Dashboard</li>
                                </ul>
                            </div>

                            <div>
                                <div className="text-sm font-semibold text-gray-300 mb-4">Akun</div>
                                <ul className="space-y-2 text-sm text-gray-500">
                                    {auth.user ? (
                                        <li>
                                            <Link href={route('dashboard')} className="hover:text-emerald-400 transition-colors">Dashboard</Link>
                                        </li>
                                    ) : (
                                        <>
                                            <li><Link href={route('login')} className="hover:text-emerald-400 transition-colors">Log in</Link></li>
                                            <li><Link href={route('register')} className="hover:text-emerald-400 transition-colors">Daftar Gratis</Link></li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-xs text-gray-600">&copy; 2025 NutriGuard. All rights reserved.</p>
                            <p className="text-xs text-gray-600">
                                Made with <span className="text-emerald-500">♥</span> for Indonesian families
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
