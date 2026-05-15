import { Link, Head } from '@inertiajs/react';
import { useEffect, useState, useRef, useMemo, lazy, Suspense } from 'react';
import { Menu, X } from 'lucide-react';
import ThemeToggle from '@/Components/ThemeToggle';
import PrimaryButton from '@/Components/PrimaryButton';
import logo from '@/images/logo-nutri-copy.png';
import RevealOnScroll from '@/Components/RevealOnScroll';
import ChatbotWidget from '@/Components/ChatbotWidget';
import bgPattern from '@/images/bg_2.webp';

// Vector assets untuk section "Apa itu NutriGuard?"
import imgBackground from '@/images/people and background@4x.png';
import imgAwan from '@/images/awan@4x.png';
import imgBotolKecap from '@/images/botol kecap@4x.png';
import imgSayur from '@/images/sayur@4x.png';
import imgAlpukat from '@/images/alpukat@4x.png';
import imgDaging from '@/images/daging@4x.png';
import imgLabu from '@/images/labu@4x.png';
import imgSusu from '@/images/susu@4x.png';
import imgOranSusuAlmod from '@/images/oran susu almod@4x.png';
import imgTelur from '@/images/telur@4x.png';
import imgTerong from '@/images/terong@4x.png';
import imgDonut from '@/images/donut@4x.png';
import NutriBot from '@/Components/NutriBot';

// Typewriter yang loop terus: ketik → pause → hapus → ulangi
function TypewriterText({ text, speed = 80, pause = 3000 }) {
    const [displayed, setDisplayed] = useState('');
    const [phase, setPhase] = useState('typing'); // typing | hold | erasing

    useEffect(() => {
        let t;
        if (phase === 'typing') {
            if (displayed.length < text.length) {
                t = setTimeout(() => setDisplayed(text.slice(0, displayed.length + 1)), speed);
            } else {
                t = setTimeout(() => setPhase('hold'), pause);
            }
        } else if (phase === 'hold') {
            t = setTimeout(() => setPhase('erasing'), pause);
        } else {
            if (displayed.length > 0) {
                t = setTimeout(() => setDisplayed(prev => prev.slice(0, -1)), speed / 2);
            } else {
                setPhase('typing');
            }
        }
        return () => clearTimeout(t);
    }, [displayed, phase, text, speed, pause]);

    return (
        <span>
            {displayed}
            <span className="border-r-2 border-gray-900 dark:border-white ml-0.5"
                style={{ animation: 'blink-cursor 0.9s step-end infinite' }} />
        </span>
    );
}

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
    {
        name: 'Dewi Kartika',
        role: 'Ibu, 3 anak',
        quote: 'Laporan mingguan NutriGuard sangat membantu saya memantau perkembangan gizi anak-anak. Saya bisa langsung tahu kalau ada yang kurang dan segera diperbaiki menu makannya.',
        rating: 5,
        initials: 'DK',
        color: 'from-pink-500 to-rose-600',
    },
    {
        name: 'Rizky Firmansyah',
        role: 'Atlet & Personal Trainer',
        quote: 'Sebagai personal trainer, saya rekomendasikan NutriGuard ke semua klien. Tracking makronutrien yang akurat dan mudah digunakan — jauh lebih praktis dari metode manual.',
        rating: 5,
        initials: 'RF',
        color: 'from-blue-500 to-indigo-600',
    },
];

const FEATURE_PILLS = [
    { icon: '🔥', label: 'Lacak Kalori',     color: 'bg-orange-100/60 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200/60 dark:border-orange-800/40' },
    { icon: '⚖️', label: 'Gizi Seimbang',    color: 'bg-blue-100/60 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/40' },
    { icon: '📸', label: 'Scan Makanan AI',  color: 'bg-violet-100/60 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200/60 dark:border-violet-800/40' },
    { icon: '📋', label: 'Meal Planner',     color: 'bg-emerald-100/60 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40' },
    { icon: '📊', label: 'Laporan Mingguan', color: 'bg-teal-100/60 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200/60 dark:border-teal-800/40' },
];

const ABOUT_FEATURES = [
    {
        title: 'Analisis Makronutrien Akurat',
        desc: 'Hitung protein, karbohidrat, dan lemak secara real-time dari setiap makanan yang dikonsumsi.',
        path: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    },
    {
        title: 'Scan Makanan dengan AI',
        desc: 'Foto makanan Anda, dan biarkan NutriScan AI mengenali kandungan gizinya dalam hitungan detik.',
        paths: [
            'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z',
            'M15 13a3 3 0 11-6 0 3 3 0 016 0z',
        ],
    },
    {
        title: 'Pemantauan Gizi Seluruh Keluarga',
        desc: 'Pantau asupan gizi setiap anggota keluarga dalam satu dasbor, termasuk tumbuh kembang anak.',
        path: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    },
];

// ── CSS keyframes injected once (transform/opacity only — no layout thrashing) ──
const HERO_STYLES = `
  @keyframes blink-cursor {
    0%,100% { opacity: 1; }
    50%     { opacity: 0; }
  }
  @media (prefers-reduced-motion: no-preference) {
    @keyframes hero-slide-up {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0);    }
    }
    @keyframes hero-badge-pop {
      0%   { opacity: 0; transform: scale(0.82) translateY(-10px); }
      65%  { transform: scale(1.05) translateY(1px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    /* Continuous badge border shimmer */
    @keyframes badge-glow {
      0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
      50%     { box-shadow: 0 0 0 5px rgba(16,185,129,0.15); }
    }
    /* Continuous gradient sweep on "Keluarga Sehat" */
    @keyframes gradient-shift {
      0%   { background-position: 0%   50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0%   50%; }
    }
    @keyframes hero-float {
      0%,100% { transform: translateY(0px)   rotate(0deg)   scale(1);    }
      33%     { transform: translateY(-14px)  rotate(1.5deg) scale(1.01); }
      66%     { transform: translateY(-7px)   rotate(-1deg)  scale(0.99); }
    }
    @keyframes hero-glow-pulse {
      0%,100% { opacity: 0.18; transform: scale(1);    }
      50%     { opacity: 0.34; transform: scale(1.10); }
    }
    @keyframes orbit-cw  { from { transform: rotate(0deg);    } to { transform: rotate(360deg);  } }
    @keyframes orbit-ccw { from { transform: rotate(0deg);    } to { transform: rotate(-360deg); } }
    /* Independent card float */
    @keyframes card-float {
      0%,100% { transform: translateY(0px);  }
      50%     { transform: translateY(-9px); }
    }

    /* ── Vector illustration animations ── */

    /* Sayur: goyang seperti tertiup angin — pivot dari bawah */
    @keyframes sway-plant {
      0%,100% { transform: rotate(-5deg) translateX(-2px); }
      50%     { transform: rotate(5deg)  translateX(2px);  }
    }
    /* Donut chart: mengambang naik-turun */
    @keyframes float-chart {
      0%,100% { transform: translateY(0px);   }
      50%     { transform: translateY(-10px);  }
    }
    /* Daging: pulse halus seperti fresh */
    @keyframes breathe-food {
      0%,100% { transform: scale(1);     }
      50%     { transform: scale(1.028); }
    }
    /* Susu: bounce naik-turun seperti cairan */
    @keyframes float-milk {
      0%,100% { transform: translateY(0px);  }
      40%     { transform: translateY(-12px); }
      60%     { transform: translateY(-10px); }
    }
    /* Telur: rolling kiri-kanan */
    @keyframes roll-egg {
      0%,100% { transform: rotate(-8deg) translateX(-3px); }
      50%     { transform: rotate(8deg)  translateX(3px);  }
    }
    /* Terong: rocking seperti jatuh santai */
    @keyframes rock-eggplant {
      0%,100% { transform: rotate(-8deg); }
      50%     { transform: rotate(2deg);  }
    }
    /* Awan: melayang horizontal pelan */
    @keyframes cloud-drift {
      0%,100% { transform: translateX(0px);  }
      50%     { transform: translateX(8px);  }
    }
    /* Alpukat / item kecil floating */
    @keyframes float-item {
      0%,100% { transform: translateY(0px) rotate(0deg);   }
      50%     { transform: translateY(-8px) rotate(3deg);  }
    }
    /* Testimonial marquee: infinite scroll kanan → kiri */
    @keyframes marquee-rtl {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }
    /* Entrance: semua vector masuk dari bawah */
    @keyframes vec-enter {
      from { opacity: 0; transform: translateY(30px) scale(0.92); }
      to   { opacity: 1; transform: translateY(0)    scale(1);    }
    }
    @keyframes particle-rise {
      0%   { transform: translateY(0)      scale(0.65) rotate(0deg);   opacity: 0;   }
      8%   { opacity: 1; }
      92%  { opacity: 1; }
      100% { transform: translateY(-110vh) scale(1.2)  rotate(180deg); opacity: 0;   }
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .hero-anim { animation: none !important; opacity: 1 !important; transform: none !important; }
  }
`;

// ── Particle shapes: leaf, sparkle, drop, diamond, circle ──────────────────
const PARTICLE_TYPES = ['leaf', 'sparkle', 'drop', 'circle', 'diamond', 'leaf', 'circle', 'sparkle'];

function FloatingParticle({ type, size, color, opacity, animStyle }) {
    const base = { display: 'block', flexShrink: 0 };
    if (type === 'leaf') return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}
            style={{ ...base, opacity, ...animStyle }} aria-hidden="true">
            <path d="M6.5 2C6.5 2 5 10 9 15c2 2.5 5.5 3.5 8.5 3C18 14 17 10 14 7 11 4 6.5 2 6.5 2z" />
            <path d="M6.5 2 Q10 12 17 18" fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
        </svg>
    );
    if (type === 'sparkle') return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}
            style={{ ...base, opacity, ...animStyle }} aria-hidden="true">
            <path d="M12 2L13.6 9.4L21 11L13.6 12.6L12 20L10.4 12.6L3 11L10.4 9.4Z" />
        </svg>
    );
    if (type === 'drop') return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}
            style={{ ...base, opacity, ...animStyle }} aria-hidden="true">
            <path d="M12 2L7 10C7 13.3 9.2 16 12 16C14.8 16 17 13.3 17 10Z" />
        </svg>
    );
    if (type === 'diamond') return (
        <div aria-hidden="true" style={{
            width: size, height: size,
            backgroundColor: color, opacity,
            borderRadius: 2,
            transform: `rotate(45deg) ${animStyle.transform ?? ''}`,
            animation: animStyle.animation,
        }} />
    );
    // circle (default)
    return (
        <div aria-hidden="true" style={{
            width: size, height: size,
            backgroundColor: color, opacity,
            borderRadius: '50%',
            ...animStyle,
        }} />
    );
}

// ── FAQ Data ─────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
    {
        q: 'Apa itu NutriGuard?',
        a: 'NutriGuard adalah platform manajemen nutrisi keluarga berbasis AI. Dengan NutriGuard, kamu bisa scan makanan, lacak kalori harian, generate resep sehat, dan pantau perkembangan gizi seluruh anggota keluarga dalam satu aplikasi.',
    },
    {
        q: 'Bagaimana cara kerja NutriScan?',
        a: 'Cukup foto makananmu menggunakan kamera, dan AI kami akan mengidentifikasi jenis makanan beserta kandungan gizinya secara otomatis — termasuk kalori, protein, karbohidrat, lemak, dan lainnya. Kamu bisa langsung simpan ke jurnal makanan harianmu.',
    },
    {
        q: 'Apakah NutriGuard gratis?',
        a: 'Ya! NutriGuard tersedia gratis dengan fitur lengkap termasuk NutriScan (20 scan/hari), FitChef, Meal Planner, dan Family Dashboard. Tidak ada biaya tersembunyi.',
    },
    {
        q: 'Apakah data kesehatan saya aman?',
        a: 'Keamanan data adalah prioritas kami. Semua data gizi dan kesehatan kamu dienkripsi dan tidak pernah dibagikan kepada pihak ketiga. Kamu memiliki kendali penuh atas datamu sendiri.',
    },
    {
        q: 'Berapa banyak anggota keluarga yang bisa dipantau?',
        a: 'Tidak ada batas jumlah anggota keluarga! Kamu bisa menambahkan seluruh anggota keluarga — ayah, ibu, anak, bahkan lansia — dan memantau nutrisi masing-masing secara terpisah dalam satu akun.',
    },
    {
        q: 'Bagaimana FitChef membuat resep?',
        a: 'FitChef menggunakan AI untuk menghasilkan resep sehat berdasarkan bahan-bahan yang kamu miliki di rumah, sisa kuota kalori harian, dan pantangan alergi anggota keluarga. Setiap resep dilengkapi takaran bahan yang tepat dan langkah memasak yang detail.',
    },
    {
        q: 'Apakah NutriGuard tersedia di semua perangkat?',
        a: 'NutriGuard dapat diakses melalui browser di perangkat apapun — smartphone, tablet, maupun komputer. Tampilan responsif dan dioptimalkan untuk penggunaan mobile.',
    },
    {
        q: 'Bisakah saya mengekspor laporan gizi?',
        a: 'Tentu! Kamu bisa mengunduh laporan nutrisi mingguan dalam format PDF langsung dari halaman Laporan. Laporan berisi breakdown kalori harian, rata-rata makro, dan insight kesehatan.',
    },
];

function FaqSection() {
    const [open, setOpen] = useState(null);
    return (
        <section id="faq" className="relative py-24 overflow-hidden bg-gray-50 dark:bg-gray-950">
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-400/15 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/15 dark:bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-400/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <RevealOnScroll>
                    <div className="text-center mb-14">
                        <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-100/70 dark:bg-emerald-900/40 backdrop-blur-sm text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 mb-4">
                            FAQ
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                            Seputar <span className="text-emerald-600 dark:text-emerald-400">NutriGuard</span>
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">Temukan jawaban untuk pertanyaan umum tentang NutriGuard</p>
                    </div>
                </RevealOnScroll>
                <div className="space-y-3">
                    {FAQ_ITEMS.map((item, i) => {
                        const isOpen = open === i;
                        return (
                            <RevealOnScroll key={i} delay={i * 40}>
                                <div className={`rounded-2xl border transition-all duration-700 ease-in-out ${isOpen ? 'border-emerald-300/50 dark:border-emerald-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-lg shadow-emerald-100/50 dark:shadow-none' : 'border-white/40 dark:border-gray-800/60 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md hover:border-emerald-200 dark:hover:border-emerald-800'}`}>
                                    <button
                                        onClick={() => setOpen(isOpen ? null : i)}
                                        className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer"
                                        aria-expanded={isOpen}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors ${isOpen ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                            <span className={`font-semibold text-base transition-colors ${isOpen ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>{item.q}</span>
                                        </div>
                                        <svg className={`w-5 h-5 flex-shrink-0 text-gray-400 transition-transform duration-700 ease-in-out ${isOpen ? 'rotate-180 text-emerald-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {/* Smooth slide-down animation via max-height + opacity transition */}
                                    <div className={`overflow-hidden transition-all duration-700 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="px-6 pb-5">
                                            <div className="pl-5 border-l-2 border-emerald-200 dark:border-emerald-800">
                                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.a}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </RevealOnScroll>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 500) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-24 right-6 sm:bottom-28 sm:right-8 z-40 p-3 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
            }`}
            aria-label="Scroll to top"
        >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
        </button>
    );
}

export default function Welcome({ auth }) {
    const [activeSection, setActiveSection] = useState('features');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [statsVisible, setStatsVisible] = useState(false);
    const statsRef = useRef(null);

    // Staggered vector reveal: 0=hidden, 1=group1 visible, 2=+group2, 3=+group3
    const [vecGroup, setVecGroup] = useState(0);
    const vecRef = useRef(null);

    // 14 particles — variety of shapes, stable config
    const particles = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
        id: i,
        type: PARTICLE_TYPES[i % PARTICLE_TYPES.length],
        size: 9 + Math.floor((i * 137.5) % 17),              // 9–26 px
        left: 4 + Math.floor((i * 47.3) % 92),              // 4–96 %
        duration: 11 + Math.floor((i * 31.7) % 13),              // 11–24 s
        delay: -1 * Math.floor((i * 19.1) % 12),              // stagger
        opacity: 0.05 + ((i * 0.007) % 0.09),                    // 0.05–0.14
        color: ['#10b981', '#0d9488', '#06b6d4', '#34d399'][i % 4], // emerald/teal/cyan
    })), []);

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

        // Vector staggered reveal — trigger saat section mulai masuk viewport
        let t2, t3;
        const vecObserver = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVecGroup(1);                                    // group 1: langsung
                    t2 = setTimeout(() => setVecGroup(2), 400);       // group 2: +400ms
                    t3 = setTimeout(() => setVecGroup(3), 800);       // group 3: +800ms
                    vecObserver.disconnect();
                }
            },
            { threshold: 0.1 }
        );
        if (vecRef.current) vecObserver.observe(vecRef.current);

        return () => {
            navObserver.disconnect();
            statsObserver.disconnect();
            vecObserver.disconnect();
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, []);

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: HERO_STYLES }} />
            <Head title="Welcome to NutriGuard" />

            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">

                {/* NAVBAR */}
                <nav className="border-b border-gray-200/50 dark:border-gray-800/50 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl sticky top-0 z-50 animate-fade-in-down shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            <Link href="/" className="flex items-center gap-2">
                                <img src={logo} className="w-8 h-8 rounded-lg" alt="NutriGuard Logo" />
                                <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">NutriGuard</span>
                            </Link>

                            <div className="hidden md:flex items-center space-x-6">
                                {[['Fitur', 'features'], ['Cara Kerja', 'how-it-works']].map(([label, id]) => (
                                    <a key={id} href={`#${id}`}
                                        className={`inline-block pb-1 text-sm font-medium border-b-2 transition-colors ${activeSection === id ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500' : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-emerald-500 dark:hover:text-emerald-400'}`}>
                                        {label}
                                    </a>
                                ))}
                                <Link href="/artikel" className="text-sm font-medium text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors pb-1">Artikel</Link>
                                <Link href="/tentang" className="text-sm font-medium text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors pb-1">Tentang</Link>
                                <Link href="/hubungi-kami" className="text-sm font-medium text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors pb-1">Hubungi Kami</Link>
                            </div>

                            <div className="flex items-center space-x-2 sm:space-x-4">
                                {auth.user ? (
                                    <>
                                        <Link href={route('dashboard')} className="hidden sm:inline-block"><PrimaryButton>Dashboard</PrimaryButton></Link>
                                        <ThemeToggle />
                                    </>
                                ) : (
                                    <>
                                        <Link href={route('login')} className="hidden sm:inline-block text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                                            Log in
                                        </Link>
                                        <Link href={route('register')} className="hidden sm:inline-block"><PrimaryButton>Mulai Gratis</PrimaryButton></Link>
                                        <ThemeToggle />
                                    </>
                                )}
                                
                                {/* Mobile Menu Button */}
                                <button 
                                    className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                >
                                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* MOBILE MENU */}
                    <div className={`md:hidden absolute top-16 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-[26rem] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="px-4 pt-2 pb-6 space-y-1">
                            {[['Fitur', 'features'], ['Cara Kerja', 'how-it-works']].map(([label, id]) => (
                                <a key={id} href={`#${id}`} onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-3 py-2.5 rounded-xl text-base font-medium ${activeSection === id ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'}`}>
                                    {label}
                                </a>
                            ))}
                            <Link href="/artikel" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Artikel</Link>
                            <Link href="/tentang" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Tentang</Link>
                            <Link href="/hubungi-kami" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mb-4">Hubungi Kami</Link>
                            
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-3 sm:hidden">
                                {auth.user ? (
                                    <Link href={route('dashboard')} className="w-full text-center"><PrimaryButton className="w-full justify-center">Dashboard</PrimaryButton></Link>
                                ) : (
                                    <>
                                        <Link href={route('login')} className="w-full py-2.5 px-4 text-center rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors">
                                            Log in
                                        </Link>
                                        <Link href={route('register')} className="w-full text-center"><PrimaryButton className="w-full justify-center">Mulai Gratis</PrimaryButton></Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* HERO SECTION */}
                <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-slate-50 dark:bg-gray-950 transition-colors duration-300">

                    {/* ── Dynamic atmospheric blobs (Orange & Green) ── */}
                    {/* Top Right Orange Blob */}
                    <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-orange-400/20 dark:bg-orange-500/15 rounded-full blur-[100px] pointer-events-none" />
                    
                    {/* Bottom Left Green Blob */}
                    <div className="absolute -bottom-40 -left-40 w-[700px] h-[700px] bg-emerald-400/20 dark:bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
                    
                    {/* Center Glowing Mix */}
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] pointer-events-none bg-amber-400/10 dark:bg-amber-500/10"
                        style={{ animation: 'hero-glow-pulse 8s ease-in-out infinite' }}
                    />

                    {/* ── Floating particles: leaf / sparkle / drop / diamond / circle ── */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {particles.map(p => (
                            <div key={p.id} className="absolute hero-anim"
                                style={{ left: `${p.left}%`, bottom: '-5%' }}>
                                <FloatingParticle
                                    type={p.type}
                                    size={p.size}
                                    color={p.color}
                                    opacity={p.opacity}
                                    animStyle={{ animation: `particle-rise ${p.duration}s ${p.delay}s ease-in-out infinite` }}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                            {/* ── Left: Hero Text ── */}
                            <div className="text-center lg:text-left">

                                {/* Badge — pop-in entrance + continuous glow pulse */}
                                <span
                                    className="hero-anim inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 mb-6"
                                    style={{ animation: 'hero-badge-pop 0.55s cubic-bezier(0.22,1,0.36,1) 0.05s both, badge-glow 3s ease-in-out 0.65s infinite' }}
                                >
                                    ✦ Platform Gizi Keluarga
                                </span>

                                {/* H1 — word-level stagger slide-up */}
                                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white tracking-tight leading-tight transition-colors">
                                    <span
                                        className="hero-anim inline-block"
                                        style={{ animation: 'hero-slide-up 0.65s cubic-bezier(0.22,1,0.36,1) 0.2s both' }}
                                    >
                                        <TypewriterText text="Pantau Gizi" />
                                    </span>
                                    <br />
                                    <span
                                        className="hero-anim inline-block text-gray-900 dark:text-white"
                                        style={{ animation: 'hero-slide-up 0.65s cubic-bezier(0.22,1,0.36,1) 0.38s both' }}
                                    >
                                        untuk{' '}
                                    </span>
                                    {/* "Keluarga Sehat" — entrance + continuous gradient sweep */}
                                    <span
                                        className="hero-anim inline-block"
                                        style={{
                                            backgroundImage: 'linear-gradient(to right, #10b981, #06b6d4, #10b981, #06b6d4)',
                                            backgroundSize: '300% 100%',
                                            WebkitBackgroundClip: 'text',
                                            backgroundClip: 'text',
                                            color: 'transparent',
                                            animation: 'hero-slide-up 0.65s cubic-bezier(0.22,1,0.36,1) 0.50s both, gradient-shift 5s ease-in-out 1.3s infinite',
                                        }}
                                    >
                                        Keluarga
                                    </span>
                                    {' '}
                                    <span
                                        className="hero-anim inline-block"
                                        style={{
                                            backgroundImage: 'linear-gradient(to right, #06b6d4, #10b981, #06b6d4, #10b981)',
                                            backgroundSize: '300% 100%',
                                            WebkitBackgroundClip: 'text',
                                            backgroundClip: 'text',
                                            color: 'transparent',
                                            animation: 'hero-slide-up 0.7s cubic-bezier(0.22,1,0.36,1) 0.62s both, gradient-shift 5s ease-in-out 1.6s infinite',
                                        }}
                                    >
                                        Sehat
                                    </span>
                                </h1>

                                {/* Paragraph */}
                                <p
                                    className="hero-anim mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed transition-colors"
                                    style={{ animation: 'hero-slide-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.76s both' }}
                                >
                                    Scan makanan, buat resep sehat, dan pantau gizi seluruh anggota keluarga secara real-time dalam satu platform yang mudah digunakan.
                                </p>

                                {/* CTA Buttons */}
                                <div
                                    className="hero-anim mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                                    style={{ animation: 'hero-slide-up 0.55s cubic-bezier(0.22,1,0.36,1) 0.90s both' }}
                                >
                                    <Link href={route('register')}>
                                        <button className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-sm text-white bg-emerald-500/50 backdrop-blur-md border border-emerald-400/50 shadow-lg shadow-emerald-500/25 hover:bg-emerald-400/60 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-400/40 hover:scale-105">
                                            Mulai Gratis
                                        </button>
                                    </Link>
                                    <a
                                        href="#how-it-works"
                                        className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-sm text-emerald-700 dark:text-white bg-white/20 dark:bg-white/5 backdrop-blur-md border border-emerald-300/50 dark:border-white/20 hover:bg-white/40 dark:hover:bg-white/10 shadow-md transition-all duration-300 text-center"
                                    >
                                        Cara Kerja →
                                    </a>
                                </div>

                                {/* Social proof avatars */}
                                <div
                                    className="hero-anim mt-10 flex items-center gap-4 justify-center lg:justify-start"
                                    style={{ animation: 'hero-slide-up 0.5s cubic-bezier(0.22,1,0.36,1) 1.02s both' }}
                                >
                                    <div className="flex -space-x-2">
                                        {['BS', 'SR', 'AP'].map((init, i) => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-white dark:border-emerald-950 flex items-center justify-center text-white text-xs font-bold">
                                                {init}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        <span className="text-gray-900 dark:text-white font-semibold">500+</span> keluarga sudah bergabung
                                    </p>
                                </div>

                                {/* ── Feature Pills ── */}
                                <div
                                    className="hero-anim mt-6 flex flex-wrap gap-2 justify-center lg:justify-start"
                                    style={{ animation: 'hero-slide-up 0.5s cubic-bezier(0.22,1,0.36,1) 1.14s both' }}
                                >
                                    {FEATURE_PILLS.map(({ icon, label, color }) => (
                                        <span key={label} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm shadow-sm ${color}`}>
                                            <span>{icon}</span>
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* ── Right: Floating Logo + Feature Cards ── */}
                            <div
                                className="hero-anim relative flex items-center justify-center min-h-[480px]"
                                style={{ animation: 'hero-slide-up 0.8s cubic-bezier(0.22,1,0.36,1) 0.25s both' }}
                            >
                                {/* Pulsing glow */}
                                <div
                                    className="absolute inset-0 bg-emerald-400/20 dark:bg-emerald-500/25 blur-[90px] rounded-full pointer-events-none"
                                    style={{ animation: 'hero-glow-pulse 4.5s ease-in-out infinite' }}
                                />

                                {/* Orbit ring 1 */}
                                <div
                                    className="hero-anim absolute w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] lg:w-[430px] lg:h-[430px] rounded-full border border-emerald-400/10 dark:border-emerald-400/18 pointer-events-none"
                                    style={{ animation: 'orbit-cw 30s linear infinite' }}
                                >
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-emerald-400/50 rounded-full" />
                                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-teal-400/40 rounded-full" />
                                </div>

                                {/* Orbit ring 2 */}
                                <div
                                    className="hero-anim absolute w-[230px] h-[230px] sm:w-[280px] sm:h-[280px] lg:w-[320px] lg:h-[320px] rounded-full border border-teal-400/8 dark:border-teal-400/14 pointer-events-none"
                                    style={{ animation: 'orbit-ccw 20s linear infinite' }}
                                >
                                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-400/50 rounded-full" />
                                    <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2 h-2 bg-emerald-300/60 rounded-full" />
                                </div>

                                {/* Logo */}
                                <img
                                    src={logo}
                                    alt="NutriGuard Logo"
                                    className="hero-anim w-full max-w-[260px] sm:max-w-sm lg:max-w-md relative z-10 drop-shadow-2xl"
                                    style={{ animation: 'hero-float 6s ease-in-out infinite' }}
                                />

                                {/* ── Floating Feature Cards ── */}

                                {/* Card 1: Lacak Kalori — top-left */}
                                <div
                                    className="hero-anim absolute top-6 left-0 lg:-left-4 z-20 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-emerald-100 dark:border-emerald-900/60 shadow-lg shadow-emerald-500/10"
                                    style={{ animation: 'hero-slide-up 0.5s cubic-bezier(0.22,1,0.36,1) 1.1s both, card-float 4.2s ease-in-out 1.6s infinite' }}
                                >
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">Monitor Keluarga</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">Semua anggota terpantau</p>
                                    </div>
                                </div>

                                {/* Card 2: Kalori Harian — top-right */}
                                <div
                                    className="hero-anim absolute top-6 right-0 lg:-right-4 z-20 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-orange-100 dark:border-orange-900/40 shadow-lg shadow-orange-500/10"
                                    style={{ animation: 'hero-slide-up 0.5s cubic-bezier(0.22,1,0.36,1) 1.25s both, card-float 5s ease-in-out 1.2s infinite' }}
                                >
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">Kalori Harian</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">Real-time tracking</p>
                                    </div>
                                </div>

                                {/* Card 3: Nutrisi Seimbang — bottom-left */}
                                <div
                                    className="hero-anim absolute bottom-10 left-0 lg:-left-6 z-20 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-blue-100 dark:border-blue-900/40 shadow-lg shadow-blue-500/10"
                                    style={{ animation: 'hero-slide-up 0.5s cubic-bezier(0.22,1,0.36,1) 1.4s both, card-float 4.7s ease-in-out 2s infinite' }}
                                >
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">Nutrisi Seimbang</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">Protein · Karbo · Lemak</p>
                                    </div>
                                </div>

                                {/* Card 4: Scan AI — bottom-right */}
                                <div
                                    className="hero-anim absolute bottom-10 right-0 lg:-right-4 z-20 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-violet-100 dark:border-violet-900/40 shadow-lg shadow-violet-500/10"
                                    style={{ animation: 'hero-slide-up 0.5s cubic-bezier(0.22,1,0.36,1) 1.55s both, card-float 3.9s ease-in-out 0.8s infinite' }}
                                >
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">NutriScan AI</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">Identifikasi instan</p>
                                    </div>
                                </div>

                            </div>

                        </div>
                    </div>
                </section>

                {/* STATS BAR */}
                <section ref={statsRef} className="bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/80 dark:from-emerald-950/40 dark:via-gray-900 dark:to-teal-950/40 border-b border-emerald-100/60 dark:border-emerald-900/30 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {stats.map((stat, i) => (
                                <div key={i} className="text-center bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl border border-white/60 dark:border-white/10 shadow-md shadow-emerald-500/5 py-5 px-4">
                                    <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                                        {counters[i].toLocaleString('id-ID')}{stat.suffix}
                                    </div>
                                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════
                    APA ITU NUTRIGUARD? — Illustration + content section
                    ═══════════════════════════════════════════════════════ */}
                <section className="py-20 bg-white dark:bg-gray-900 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                            {/* ── LEFT: Stacked vector illustration ── */}
                            <RevealOnScroll>
                                {/*
                                  Container aspect ratio = 1.32:1 (matches reference 825×625)
                                  All child positions are % of container WIDTH — fully responsive.
                                  paddingBottom: 76% creates the correct height at every breakpoint.

                                  ═══════ POSISI SETIAP GAMBAR ═══════
                                  Ubah nilai width/left/right/top/bottom/zIndex
                                  di masing-masing img tag di bawah ini.
                                  Semua nilai pakai % → otomatis responsif.
                                */}
                                <div
                                    ref={vecRef}
                                    className="relative w-full select-none overflow-visible"
                                    style={{ paddingBottom: '76%' }}
                                >
                                    {/* ══════════════════════════════════════════
                                        GROUP 1 — langsung saat section terlihat
                                        background + elemen dominan
                                        ══════════════════════════════════════════ */}
                                    {vecGroup >= 1 && <>
                                        {/* ── z=3 ── BACKGROUND ── eager, gambar terbesar */}
                                        <img src={imgBackground} alt="" aria-hidden="true" draggable="false"
                                            className="absolute pointer-events-none"
                                            style={{ width:'100%', left:0, bottom:0, zIndex:3,
                                                animation:'vec-enter 0.5s ease-out 0s both' }} />

                                        {/* ── z=9 ── DAGING ── elemen dominan */}
                                        <img src={imgDaging} alt="Daging segar" draggable="false" loading="lazy"
                                            className="absolute pointer-events-none"
                                            style={{ width:'30%',   /* ← ubah ukuran */
                                                left:'38%',          /* ← ubah posisi horizontal */
                                                bottom:'10%',        /* ← ubah posisi vertikal */
                                                zIndex:7, transformOrigin:'center bottom', willChange:'transform',
                                                animation:'vec-enter 0.6s ease-out 0.1s both, breathe-food 4s ease-in-out 1.2s infinite' }} />

                                        {/* ── z=13 ── DONUT CHART ── float */}
                                        <img src={imgDonut} alt="Grafik keseimbangan nutrisi" draggable="false" loading="lazy"
                                            className="absolute pointer-events-none"
                                            style={{ width:'50%',   /* ← ubah ukuran */
                                                left:'28%',          /* ← ubah posisi horizontal */
                                                top:'40%',           /* ← ubah posisi vertikal */
                                                zIndex:3, willChange:'transform',
                                                animation:'vec-enter 0.65s ease-out 0.2s both, float-chart 4.2s ease-in-out 0.8s infinite' }} />
                                    </>}

                                    {/* ══════════════════════════════════════════
                                        GROUP 2 — muncul +400ms
                                        elemen sekunder yang interaktif
                                        ══════════════════════════════════════════ */}
                                    {vecGroup >= 2 && <>
                                        {/* ── z=6 ── SAYUR ── goyang angin */}
                                        <img src={imgSayur} alt="" aria-hidden="true" draggable="false" loading="lazy"
                                            className="absolute pointer-events-none"
                                            style={{ width:'20%',   /* ← ubah ukuran */
                                                right:'15%',         /* ← ubah posisi horizontal */
                                                bottom:'15%',        /* ← ubah posisi vertikal */
                                                zIndex:6, transformOrigin:'bottom center', willChange:'transform',
                                                animation:'vec-enter 0.55s ease-out 0s both, sway-plant 3.2s ease-in-out 0.6s infinite' }} />

                                        {/* ── z=12 ── ORANG SUSU ALMOND ── float */}
                                        <img src={imgOranSusuAlmod} alt="Gaya hidup sehat" draggable="false" loading="lazy"
                                            className="absolute pointer-events-none"
                                            style={{ width:'18%',   /* ← ubah ukuran */
                                                right:'11%',         /* ← ubah posisi horizontal */
                                                bottom:'5%',         /* ← ubah posisi vertikal */
                                                zIndex:12, transformOrigin:'center bottom', willChange:'transform',
                                                animation:'vec-enter 0.6s ease-out 0.1s both, float-milk 3.5s ease-in-out 1.4s infinite' }} />

                                        {/* ── z=11 ── SUSU ── botol susu */}
                                        <img src={imgSusu} alt="Botol susu" draggable="false" loading="lazy"
                                            className="absolute pointer-events-none"
                                            style={{ width:'6%',    /* ← ubah ukuran */
                                                right:'31%',         /* ← ubah posisi horizontal */
                                                bottom:'7%',         /* ← ubah posisi vertikal */
                                                zIndex:8,
                                                animation:'vec-enter 0.5s ease-out 0.15s both' }} />

                                        {/* ── z=10 ── TELUR ── rolling */}
                                        <img src={imgTelur} alt="" aria-hidden="true" draggable="false" loading="lazy"
                                            className="absolute pointer-events-none"
                                            style={{ width:'12%',   /* ← ubah ukuran */
                                                left:'37%',          /* ← ubah posisi horizontal */
                                                bottom:'7%',         /* ← ubah posisi vertikal */
                                                zIndex:10, willChange:'transform',
                                                animation:'vec-enter 0.5s ease-out 0.2s both, roll-egg 2.5s ease-in-out 1.6s infinite' }} />
                                    </>}

                                    {/* ══════════════════════════════════════════
                                        GROUP 3 — muncul +800ms
                                        elemen dekoratif
                                        ══════════════════════════════════════════ */}
                                    {vecGroup >= 3 && <>
                                        {/* ── z=2 ── TERONG ── rocking */}
                                        <img src={imgTerong} alt="" aria-hidden="true" draggable="false" loading="lazy"
                                            className="absolute pointer-events-none"
                                            style={{ width:'22%',   /* ← ubah ukuran */
                                                left:'20%',          /* ← ubah posisi horizontal */
                                                bottom:'8%',         /* ← ubah posisi vertikal */
                                                zIndex:9, transformOrigin:'right center', willChange:'transform',
                                                animation:'vec-enter 0.55s ease-out 0s both, rock-eggplant 2.8s ease-in-out 0.6s infinite' }} />

                                        {/* ── z=4 ── AWAN ── putih di atas blob */}
                                        <img src={imgAwan} alt="" aria-hidden="true" draggable="false" loading="lazy"
                                            className="absolute pointer-events-none"
                                            style={{ width:'75%',   /* ← ubah ukuran */
                                                left:'12%',          /* ← ubah posisi horizontal */
                                                top:'50%',           /* ← ubah posisi vertikal */
                                                zIndex:4,
                                                animation:'vec-enter 0.6s ease-out 0.05s both' }} />

                                        {/* ── z=5 ── BOTOL KECAP ── 2 botol */}
                                        <img src={imgBotolKecap} alt="" aria-hidden="true" draggable="false" loading="lazy"
                                            className="absolute pointer-events-none"
                                            style={{ width:'14%',   /* ← ubah ukuran */
                                                left:'27%',          /* ← ubah posisi horizontal */
                                                bottom:'10%',        /* ← ubah posisi vertikal */
                                                zIndex:5,
                                                animation:'vec-enter 0.5s ease-out 0.1s both' }} />

                                        {/* ── z=7 ── ALPUKAT ── floating */}
                                        <img src={imgAlpukat} alt="" aria-hidden="true" draggable="false" loading="lazy"
                                            className="absolute pointer-events-none"
                                            style={{ width:'12%',   /* ← ubah ukuran */
                                                right:'35%',         /* ← ubah posisi horizontal */
                                                bottom:'3%',         /* ← ubah posisi vertikal */
                                                zIndex:12,
                                                animation:'vec-enter 0.55s ease-out 0.15s both' }} />

                                        {/* ── z=8 ── LABU ── kanan bawah */}
                                        <img src={imgLabu} alt="" aria-hidden="true" draggable="false" loading="lazy"
                                            className="absolute pointer-events-none"
                                            style={{ width:'15%',   /* ← ubah ukuran */
                                                right:'24%',         /* ← ubah posisi horizontal */
                                                bottom:'6%',         /* ← ubah posisi vertikal */
                                                zIndex:11,
                                                animation:'vec-enter 0.5s ease-out 0.2s both' }} />
                                    </>}

                                </div>
                            </RevealOnScroll>

                            {/* ── RIGHT: Content ── */}
                            <RevealOnScroll delay={150}>
                                <div className="lg:pl-6">

                                    {/* Category label */}
                                    <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-emerald-600 dark:text-emerald-400 mb-4">
                                        Menganalisis Gizi
                                    </span>

                                    {/* Title */}
                                    <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-5">
                                        Apa itu <span className="text-emerald-600 dark:text-emerald-400">NutriGuard</span>?
                                    </h2>

                                    {/* Description */}
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg mb-8">
                                        NutriGuard adalah platform nutrisi cerdas untuk keluarga Indonesia. Kami membantu Anda memahami keseimbangan gizi harian — dari makronutrien hingga kalori — secara real-time, mudah, dan akurat.
                                    </p>

                                    <ul className="space-y-5">
                                        {ABOUT_FEATURES.map((item, i) => (
                                            <li key={i} className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        {item.paths
                                                            ? item.paths.map((d, j) => <path key={j} strokeLinecap="round" strokeLinejoin="round" d={d} />)
                                                            : <path strokeLinecap="round" strokeLinejoin="round" d={item.path} />
                                                        }
                                                    </svg>
                                                </div>
                                                <div>
                                                    <span className="font-bold text-gray-900 dark:text-white">{item.title}: </span>
                                                    <span className="text-gray-600 dark:text-gray-300">{item.desc}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </RevealOnScroll>

                        </div>
                    </div>
                </section>

                {/* FEATURES SECTION */}
                <section id="features" className="relative py-24 overflow-hidden bg-gray-50 dark:bg-gray-950">
                    {/* Colored blobs untuk glass depth */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/15 dark:bg-emerald-400/8 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-400/10 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <RevealOnScroll>
                            <div className="text-center max-w-3xl mx-auto mb-16">
                                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-100/70 dark:bg-emerald-900/40 backdrop-blur-sm text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 mb-4">
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
                                    <div className="group bg-white/70 dark:bg-gray-900/70 backdrop-blur-md p-8 rounded-2xl border border-white/40 dark:border-gray-800/60 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-xl shadow-emerald-900/5 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] h-full flex flex-col">
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
                <section id="how-it-works" className="py-24 bg-gradient-to-b from-teal-50/50 via-white to-emerald-50/40 dark:from-teal-950/20 dark:via-gray-900 dark:to-emerald-950/20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <RevealOnScroll>
                            <div className="text-center max-w-3xl mx-auto mb-16">
                                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-cyan-100/70 dark:bg-cyan-900/40 backdrop-blur-sm text-cyan-700 dark:text-cyan-400 border border-cyan-200/60 dark:border-cyan-800/40 mb-4">
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
                                                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-emerald-500/70 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-extrabold shadow-md">
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
                                    <button className="px-8 py-4 rounded-full font-bold text-sm text-white bg-emerald-500/50 backdrop-blur-md border border-emerald-400/50 shadow-lg shadow-emerald-500/25 hover:bg-emerald-400/60 transition-all duration-300 hover:scale-105">
                                        Coba Sekarang — Gratis
                                    </button>
                                </Link>
                            </div>
                        </RevealOnScroll>
                    </div>
                </section>

                {/* FAQ SECTION */}
                <FaqSection />

                {/* TESTIMONIALS */}
                <section id="testimonials" className="relative py-24 overflow-hidden bg-gradient-to-b from-emerald-50/40 via-white to-orange-50/20 dark:from-emerald-950/20 dark:via-gray-900 dark:to-orange-950/10">
                    {/* Blur circles agar frosted glass card lebih terlihat */}
                    <div className="absolute top-10 left-[10%] w-80 h-80 bg-emerald-400/25 dark:bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute top-20 right-[15%] w-96 h-96 bg-orange-400/20 dark:bg-orange-400/12 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-60 bg-teal-400/18 dark:bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <RevealOnScroll>
                            <div className="text-center max-w-3xl mx-auto mb-16">
                                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-orange-100/70 dark:bg-orange-900/40 backdrop-blur-sm text-orange-700 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/40 mb-4">
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

                        {/* Marquee kanan → kiri, duplikat untuk seamless loop */}
                        <div className="relative overflow-hidden">
                            {/* Fade edges */}
                            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />
                            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />

                            <div
                                className="flex gap-6 w-max py-6 px-4"
                                style={{ animation: 'marquee-rtl 28s linear infinite' }}
                                onMouseEnter={e => e.currentTarget.style.animationPlayState = 'paused'}
                                onMouseLeave={e => e.currentTarget.style.animationPlayState = 'running'}
                            >
                                {/* Original + duplicate untuk seamless loop */}
                                {[...testimonials, ...testimonials].map((t, i) => (
                                    <div key={i} className="w-80 flex-shrink-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md p-7 rounded-2xl border border-white/40 dark:border-gray-700/60 flex flex-col select-none shadow-xl shadow-black/5 hover:scale-105 transition-transform duration-300">
                                        <div className="flex gap-1 mb-4">
                                            {Array.from({ length: t.rating }).map((_, j) => (
                                                <span key={j} className="text-amber-400 text-base">★</span>
                                            ))}
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed flex-1 italic text-sm">
                                            "{t.quote}"
                                        </p>
                                        <div className="mt-5 flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                                                {t.initials}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{t.role}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ABOUT SECTION */}
                <section id="about" className="py-24 bg-gradient-to-b from-teal-50/30 via-emerald-50/20 to-white dark:from-teal-950/15 dark:via-emerald-950/10 dark:to-gray-950">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <RevealOnScroll>
                            <div className="text-center max-w-3xl mx-auto mb-12">
                                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-100/70 dark:bg-emerald-900/40 backdrop-blur-sm text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 mb-4">
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
                                <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl border border-white/40 dark:border-gray-800/60 hover:border-emerald-300 dark:hover:border-emerald-700 p-8 h-full transition-all duration-300 hover:scale-[1.02] hover:-translate-y-2 shadow-xl shadow-emerald-900/5">
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
                                <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl border border-white/40 dark:border-gray-800/60 hover:border-emerald-300 dark:hover:border-emerald-700 p-8 h-full transition-all duration-300 hover:scale-[1.02] hover:-translate-y-2 shadow-xl shadow-emerald-900/5">
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
                            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md border border-white/30 text-white mb-6">
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
                                    <button className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-sm text-emerald-800 bg-white/60 backdrop-blur-md border border-white/70 shadow-lg shadow-black/15 hover:bg-white/80 hover:scale-105 transition-all duration-300">
                                        Daftar Gratis Sekarang
                                    </button>
                                </Link>
                                <a
                                    href="#features"
                                    className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-sm text-white bg-white/10 backdrop-blur-md border border-white/40 hover:bg-white/20 shadow-md transition-all duration-300 text-center"
                                >
                                    Lihat Semua Fitur
                                </a>
                            </div>
                        </RevealOnScroll>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                            <div className="text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-3">
                                    <img src={logo} className="w-9 h-9 rounded-lg" alt="NutriGuard Logo" />
                                    <span className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">NutriGuard</span>
                                </div>
                                <p className="mt-4 text-sm text-gray-500 max-w-xs">
                                    Platform pemantauan gizi keluarga untuk hidup yang lebih sehat setiap harinya.
                                </p>
                            </div>

                            <div>
                                <div className="text-sm font-semibold text-gray-900 dark:text-gray-300 mb-4">Jelajahi</div>
                                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-500">
                                    <li><a href="#features" className="hover:text-emerald-400 transition-colors">Fitur</a></li>
                                    <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors">Cara Kerja</a></li>
                                    <li><a href="#about" className="hover:text-emerald-400 transition-colors">Tentang</a></li>
                                </ul>
                            </div>

                            <div>
                                <div className="text-sm font-semibold text-gray-900 dark:text-gray-300 mb-4">Produk</div>
                                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-500">
                                    <li>NutriScan</li>
                                    <li>FitChef</li>
                                    <li>Family Dashboard</li>
                                </ul>
                            </div>

                            <div>
                                <div className="text-sm font-semibold text-gray-900 dark:text-gray-300 mb-4">Akun</div>
                                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-500">
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

                        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-xs text-gray-500 dark:text-gray-600">&copy; 2025 NutriGuard. All rights reserved.</p>
                            <p className="text-xs text-gray-500 dark:text-gray-600">
                                Made with <span className="text-emerald-500">♥</span> for Indonesian families
                            </p>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Floatings */}
            <ScrollToTop />
            <NutriBot />
        </>
    );
}
