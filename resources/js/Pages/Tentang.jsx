import { Head, Link } from '@inertiajs/react';
import PublicNavbar from '@/Components/PublicNavbar';
import bgPattern from '@/images/bg_2.webp';

const PAGE_ANIM = `
  @keyframes page-up { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
  .page-s1 { animation: page-up 0.55s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
  .page-s2 { animation: page-up 0.55s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
  .page-s3 { animation: page-up 0.55s cubic-bezier(0.22,1,0.36,1) 0.25s both; }
  .page-s4 { animation: page-up 0.55s cubic-bezier(0.22,1,0.36,1) 0.35s both; }
`;

const COMMITMENTS = [
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
        title: 'Analisis Instan & Cepat',
        desc: 'Kami berkomitmen menyediakan data nutrisi real-time. Tidak perlu menunggu; masukkan makanan, dapatkan hasil detik itu juga.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
        title: 'Akurasi & Verifikasi Data',
        desc: 'Setiap data diverifikasi silang dengan sumber otoritatif dan ditinjau untuk menjamin informasi yang terpercaya.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        ),
        title: 'Privasi Data Kesehatan',
        desc: 'Kesehatan Anda adalah hal pribadi. Kami menjamin kerahasiaan penuh. Data pelacakan Anda dienkripsi dan tidak akan pernah dibagikan.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        title: 'Pengalaman Pengguna Terbaik',
        desc: 'Kami terus berinovasi untuk membuat pelacakan nutrisi menjadi intuitif dan menyenangkan, bukan menjadi tugas yang membebani.',
    },
];

const MISI = [
    'Membantu keluarga Indonesia memahami dan mengelola asupan nutrisi harian dengan mudah',
    'Memberikan edukasi gizi yang akurat dan berbasis sains dalam format yang mudah dipahami',
    'Mendukung pencegahan penyakit tidak menular melalui gaya hidup sehat berbasis data',
    'Menghadirkan teknologi AI yang membuat pemantauan gizi lebih personal dan relevan',
];

export default function Tentang({ auth }) {
    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: PAGE_ANIM }} />
            <Head title="Tentang NutriGuard" />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">

                <PublicNavbar auth={auth} active="Tentang" />

                {/* Hero — Tentang Kami */}
                <section className="relative py-20 overflow-hidden bg-gray-50 dark:bg-gray-950">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/15 dark:bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-400/15 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-amber-400/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center page-s1">
                        <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 mb-6">
                            Tentang Kami
                        </span>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-tight mb-6">
                            Membangun Keluarga <span className="text-emerald-600 dark:text-emerald-400">Lebih Sehat</span>
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
                            NutriGuard lahir dari keyakinan bahwa setiap keluarga berhak mendapatkan akses mudah
                            terhadap informasi gizi yang akurat dan alat yang membantu mereka hidup lebih sehat.
                        </p>
                    </div>
                </section>

                {/* Visi & Misi */}
                <section className="relative py-20 overflow-hidden bg-gray-50 dark:bg-gray-950">
                    <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-orange-400/15 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-emerald-400/15 dark:bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-amber-400/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 page-s2">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                            {/* Visi */}
                            <div>
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-semibold mb-6">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    Visi Kami
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Menjadi platform nutrisi keluarga terpercaya di Indonesia</h2>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                                    Kami bermimpi tentang Indonesia di mana setiap keluarga memiliki pemahaman mendalam
                                    tentang apa yang mereka makan, dan memiliki alat yang tepat untuk menjaga kesehatan
                                    generasi berikutnya dari stunting dan penyakit tidak menular.
                                </p>
                            </div>

                            {/* Misi */}
                            <div>
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-sm font-semibold mb-6">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                    Misi Kami
                                </div>
                                <ul className="space-y-4">
                                    {MISI.map((m, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                                {i + 1}
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{m}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Komitmen */}
                <section className="relative py-20 overflow-hidden bg-gray-50 dark:bg-gray-950">
                    <div className="absolute top-0 left-1/4 w-80 h-80 bg-orange-400/15 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-emerald-400/15 dark:bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-400/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-3">
                                Komitmen Kami <span className="text-emerald-600 dark:text-emerald-400">Untuk Anda</span>
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                                Kami membangun NutriGuard berdasarkan empat pilar utama untuk memberikan pengalaman nutrisi terbaik.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {COMMITMENTS.map((c, i) => (
                                <div key={i} className="rounded-2xl p-6 border border-white/40 dark:border-gray-800/60 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md hover:border-emerald-300 dark:hover:border-emerald-700 shadow-xl shadow-emerald-900/5 hover:scale-105 hover:-translate-y-2 transition-all duration-300">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                                        {c.icon}
                                    </div>
                                    <h3 className="font-bold text-base mb-2 text-gray-900 dark:text-white">{c.title}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{c.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600">
                    <div className="max-w-3xl mx-auto px-4 text-center">
                        <h2 className="text-3xl font-black text-white mb-4">Mulai Perjalanan Sehat Bersama Kami</h2>
                        <p className="text-emerald-100 mb-8">Bergabung dengan 500+ keluarga yang sudah mempercayakan nutrisi mereka kepada NutriGuard.</p>
                        <Link href={route('register')} className="inline-block px-8 py-4 bg-white/50 backdrop-blur-md border border-white/60 text-emerald-800 font-bold rounded-full hover:bg-white/70 shadow-lg shadow-black/15 hover:scale-105 transition-all duration-300">
                            Mulai Gratis Sekarang
                        </Link>
                    </div>
                </section>

            </div>
        </>
    );
}
