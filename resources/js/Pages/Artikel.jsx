import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import PublicNavbar from '@/Components/PublicNavbar';

const PAGE_ANIM = `
  @keyframes page-up { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
  .page-s1 { animation: page-up 0.55s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
  .page-s2 { animation: page-up 0.55s cubic-bezier(0.22,1,0.36,1) 0.2s  both; }
  .page-s3 { animation: page-up 0.55s cubic-bezier(0.22,1,0.36,1) 0.35s both; }
`;

const ARTICLES = [
    {
        id: 1,
        category: 'Nutrisi Dasar',
        tag: 'Protein',
        date: '10 Mei 2026',
        title: 'Sumber Protein Terbaik untuk Pertumbuhan dan Perbaikan Otot',
        excerpt: 'Protein adalah makronutrien penting yang dibutuhkan tubuh untuk membangun dan memperbaiki jaringan. Temukan sumber protein terbaik yang mudah didapatkan di Indonesia.',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
        readTime: '4 menit',
    },
    {
        id: 2,
        category: 'Pencernaan',
        tag: 'Serat',
        date: '8 Mei 2026',
        title: 'Pentingnya Serat Makanan bagi Kesehatan Usus',
        excerpt: 'Serat makanan berperan krusial dalam menjaga kesehatan sistem pencernaan. Pelajari bagaimana serat membantu keseimbangan mikrobioma usus dan mencegah berbagai penyakit.',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
        readTime: '5 menit',
    },
    {
        id: 3,
        category: 'Hidrasi',
        tag: 'Air Putih',
        date: '6 Mei 2026',
        title: 'Manfaat Air Putih untuk Tubuh yang Optimal',
        excerpt: 'Air sering kali dianggap sepele, namun perannya bagi kesehatan sangat besar. Ketahui berapa kebutuhan cairan harian Anda dan dampak dehidrasi pada performa tubuh.',
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&q=80',
        readTime: '3 menit',
    },
    {
        id: 4,
        category: 'Gizi Anak',
        tag: 'Stunting',
        date: '4 Mei 2026',
        title: 'Mencegah Stunting: Nutrisi Tepat di 1000 Hari Pertama',
        excerpt: 'Seribu hari pertama kehidupan adalah periode emas yang menentukan tumbuh kembang anak. Panduan lengkap nutrisi untuk ibu hamil hingga anak usia 2 tahun.',
        image: 'https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=600&q=80',
        readTime: '6 menit',
    },
    {
        id: 5,
        category: 'Makanan Sehat',
        tag: 'Antioksidan',
        date: '2 Mei 2026',
        title: '10 Makanan Kaya Antioksidan yang Wajib Ada di Meja Makan',
        excerpt: 'Antioksidan melindungi sel tubuh dari kerusakan akibat radikal bebas. Temukan 10 makanan super yang mudah ditemukan dan kaya antioksidan untuk kesehatan jangka panjang.',
        image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80',
        readTime: '4 menit',
    },
    {
        id: 6,
        category: 'Metabolisme',
        tag: 'Kalori',
        date: '30 Apr 2026',
        title: 'Memahami Kalori: Bukan Sekadar Angka di Label Makanan',
        excerpt: 'Kalori adalah satuan energi, bukan musuh. Pahami bagaimana tubuh memproses kalori dari berbagai sumber makanan dan cara menghitung kebutuhan kalori harian Anda.',
        image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&q=80',
        readTime: '5 menit',
    },
];

const CATEGORIES = ['Semua', 'Nutrisi Dasar', 'Pencernaan', 'Hidrasi', 'Gizi Anak', 'Makanan Sehat', 'Metabolisme'];

export default function Artikel({ auth }) {
    const [activeCategory, setActiveCategory] = useState('Semua');

    const filtered = activeCategory === 'Semua'
        ? ARTICLES
        : ARTICLES.filter(a => a.category === activeCategory);

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: PAGE_ANIM }} />
            <Head title="Artikel Kesehatan — NutriGuard" />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">

                <PublicNavbar auth={auth} active="Artikel" />

                {/* Hero */}
                <section className="py-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center page-s1">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 mb-5">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Wawasan Sehat dari NutriGuard
                        </span>
                        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
                            Jendela <span className="text-emerald-600 dark:text-emerald-400">Nutrisi Sehat</span> Anda
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                            Kumpulan artikel pilihan yang dikurasi. Dapatkan pengetahuan mendalam untuk gaya hidup yang lebih baik.
                        </p>
                    </div>
                </section>

                {/* Filter */}
                <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-b border-white/40 dark:border-gray-800/60 sticky top-16 z-40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat ? 'bg-emerald-600/90 backdrop-blur-md text-white shadow-lg shadow-emerald-500/30' : 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/40 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:text-emerald-700 dark:hover:text-emerald-400'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Articles Grid */}
                <section className="py-12 page-s3">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filtered.map(article => (
                                <article key={article.id} className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl overflow-hidden border border-white/40 dark:border-gray-800/60 shadow-lg shadow-emerald-900/5 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 group">
                                    <div className="relative h-52 overflow-hidden">
                                        <img
                                            src={article.image}
                                            alt={article.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                        <div className="absolute top-3 left-3">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/55 backdrop-blur-sm border border-emerald-400/50 text-white text-xs font-semibold">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                                {article.tag}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {article.date}
                                            </span>
                                            <span>·</span>
                                            <span>{article.readTime} baca</span>
                                        </div>
                                        <h2 className="font-bold text-gray-900 dark:text-white text-base leading-snug mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                                            {article.title}
                                        </h2>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4">
                                            {article.excerpt}
                                        </p>
                                        <button className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm font-semibold hover:gap-2 transition-all">
                                            Baca Selengkapnya
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
