import { Head, Link, useForm } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import PublicNavbar from '@/Components/PublicNavbar';
import bgPattern from '@/images/bg_2.webp';
import { CheckCircle, Send, Mail, MessageSquare, User, BookOpen } from 'lucide-react';

const PAGE_ANIM = `
  @keyframes page-up { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
  .page-s1 { animation: page-up 0.55s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
  .page-s2 { animation: page-up 0.55s cubic-bezier(0.22,1,0.36,1) 0.2s  both; }
`;

export default function HubungiKami({ auth }) {
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        name:    '',
        email:   '',
        subject: '',
        message: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('contact.send'), {
            onSuccess: () => reset(),
        });
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: PAGE_ANIM }} />
            <Head title="Hubungi Kami — NutriGuard" />
            <div className="relative min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
                <div className="absolute top-1/4 right-0 w-96 h-96 bg-orange-400/15 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-emerald-400/15 dark:bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-400/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative">
                <PublicNavbar auth={auth} active="Hubungi Kami" />

                {/* Hero */}
                <section className="py-16 text-center border-b border-white/60 dark:border-gray-800/60">
                    <div className="max-w-2xl mx-auto px-4 page-s1">
                        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">Mari Terhubung</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            Kami ingin mendengar dari Anda. Hubungi kami dengan pertanyaan, masukan, atau sekadar untuk mengucapkan salam.
                        </p>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 page-s2">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                        {/* Info Cards */}
                        <div className="space-y-5">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Informasi Kontak</h2>
                            {[
                                { icon: Mail, title: 'Email', desc: 'Tim kami merespons dalam 1×24 jam kerja', value: 'support@nutriguard.id' },
                                { icon: MessageSquare, title: 'Chatbot', desc: 'Tanya langsung lewat chatbot kami', value: 'Tersedia 24/7 di halaman utama' },
                                { icon: BookOpen, title: 'Artikel & Panduan', desc: 'Temukan jawaban di artikel kami', value: 'nutriguard.id/artikel' },
                            ].map(({ icon: Icon, title, desc, value }) => (
                                <div key={title} className="flex items-start gap-4 p-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl border border-white/40 dark:border-gray-800/60 shadow-xl shadow-emerald-900/5 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300">
                                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{title}</p>
                                        <p className="text-gray-400 text-xs mt-0.5">{desc}</p>
                                        <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium mt-1">{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl border border-white/40 dark:border-gray-800/60 p-8 shadow-xl shadow-emerald-900/5">

                                {/* Success */}
                                {flash?.success && (
                                    <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl mb-6">
                                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                        <p className="text-emerald-700 dark:text-emerald-300 text-sm font-medium">{flash.success}</p>
                                    </div>
                                )}

                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Kirim Pesan Kami</h2>

                                <form onSubmit={submit} className="space-y-5">
                                    {/* Nama + Email */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                Nama Lengkap <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    id="name"
                                                    type="text"
                                                    value={data.name}
                                                    onChange={e => setData('name', e.target.value)}
                                                    placeholder="Nama Anda"
                                                    autoComplete="name"
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-colors"
                                                />
                                            </div>
                                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                Email <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    id="email"
                                                    type="email"
                                                    value={data.email}
                                                    onChange={e => setData('email', e.target.value)}
                                                    placeholder="email@contoh.com"
                                                    autoComplete="email"
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-colors"
                                                />
                                            </div>
                                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                        </div>
                                    </div>

                                    {/* Subjek */}
                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Subjek <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="subject"
                                            type="text"
                                            value={data.subject}
                                            onChange={e => setData('subject', e.target.value)}
                                            placeholder="Subjek pesan Anda"
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-colors"
                                        />
                                        {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                                    </div>

                                    {/* Pesan */}
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Pesan <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            id="message"
                                            rows={5}
                                            value={data.message}
                                            onChange={e => setData('message', e.target.value)}
                                            placeholder="Tulis pesan Anda di sini..."
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-colors resize-none"
                                        />
                                        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-500/50 backdrop-blur-md border border-emerald-400/50 hover:bg-emerald-400/60 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:scale-[1.01] text-sm"
                                    >
                                        {processing ? (
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                        ) : <Send className="w-4 h-4" />}
                                        {processing ? 'Mengirim...' : 'Kirim Pesan'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}
