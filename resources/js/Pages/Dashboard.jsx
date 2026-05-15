import { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Scan, ChefHat, AlertTriangle, X, Coffee, Sun, Sunset, Moon, Plus, TrendingUp, Mail } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';
import FadeUp from '@/Components/FadeUp';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const MEAL_META = {
    breakfast: { label: 'Sarapan',     icon: Coffee,  color: 'text-amber-500' },
    lunch:     { label: 'Makan Siang', icon: Sun,     color: 'text-emerald-500' },
    dinner:    { label: 'Makan Malam', icon: Sunset,  color: 'text-violet-500' },
    snack:     { label: 'Snack',       icon: Moon,    color: 'text-orange-500' },
};

function CalorieRing({ current, goal }) {
    const pct   = Math.min(100, goal > 0 ? (current / goal) * 100 : 0);
    const r     = 52;
    const circ  = 2 * Math.PI * r;
    const dash  = (pct / 100) * circ;
    const color = pct > 110 ? '#ef4444' : pct > 85 ? '#f59e0b' : '#10b981';

    // Animate the ring drawing from 0 to dash
    const [animDash, setAnimDash] = useState(0);
    useEffect(() => {
        const t = setTimeout(() => setAnimDash(dash), 120);
        return () => clearTimeout(t);
    }, [dash]);

    return (
        <div className="relative w-36 h-36 mx-auto">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-gray-100 dark:text-gray-800" />
                <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
                    strokeDasharray={`${animDash} ${circ}`} strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.22,1,0.36,1)' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-extrabold text-gray-900 dark:text-white">{current.toLocaleString('id-ID')}</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">dari {goal.toLocaleString('id-ID')}</span>
                <span className="text-[10px] text-gray-400">kkal</span>
            </div>
        </div>
    );
}

function AnimatedBar({ label, value, max, color, delay = 0 }) {
    const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0);
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const t = setTimeout(() => setWidth(pct), 200 + delay);
        return () => clearTimeout(t);
    }, [pct, delay]);
    return (
        <div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>{label}</span><span>{Math.round(value)}g</span>
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`}
                    style={{ width: `${width}%`, transition: `width 1s cubic-bezier(0.22,1,0.36,1)` }} />
            </div>
        </div>
    );
}

export default function Dashboard({ auth, familyMembers, logsByMealType, dailyStats, weeklyChartData, healthWarning, success }) {
    const [dismissWarning, setDismissWarning] = useState(false);
    const [activeMeal, setActiveMeal]         = useState('breakfast');
    const [isInviteOpen, setIsInviteOpen]     = useState(false);

    const { data: inviteData, setData: setInviteData, post: postInvite, processing: inviteProcessing, errors: inviteErrors, reset: resetInvite } = useForm({
        email: ''
    });

    const submitInvite = (e) => {
        e.preventDefault();
        postInvite(route('family.invite'), {
            onSuccess: () => {
                setIsInviteOpen(false);
                resetInvite();
            }
        });
    };

    const proteinGoal = Math.round((dailyStats.goal_calories * 0.25) / 4);
    const carbsGoal   = Math.round((dailyStats.goal_calories * 0.50) / 4);
    const fatGoal     = Math.round((dailyStats.goal_calories * 0.25) / 9);

    const chartData = {
        labels: weeklyChartData.labels,
        datasets: [{
            data: weeklyChartData.data,
            fill: true,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16,185,129,0.07)',
            tension: 0.4,
            pointBackgroundColor: '#10b981',
            pointRadius: 4,
        }],
    };
    const chartOptions = {
        responsive: true, maintainAspectRatio: false,
        animation: {
            duration: 2000,
            easing: 'easeOutQuart'
        },
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 11 } } },
            y: { grid: { color: 'rgba(156,163,175,0.1)' }, ticks: { color: '#9ca3af', font: { size: 11 } }, beginAtZero: true },
        },
    };

    const currentLogs = logsByMealType?.[activeMeal] ?? [];
    const mealCals    = currentLogs.reduce((s, l) => s + (l.calories || 0), 0);

    return (
        <AuthenticatedLayout user={auth.user} header="Dashboard">
            <Head title="Dashboard" />
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">

                {healthWarning && !dismissWarning && (
                    <FadeUp delay={0}>
                    <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 dark:text-red-300 flex-1">{healthWarning}</p>
                        <button onClick={() => setDismissWarning(true)}><X className="w-4 h-4 text-red-400" /></button>
                    </div>
                    </FadeUp>
                )}

                {success && (
                    <FadeUp delay={0}>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm text-emerald-700 dark:text-emerald-300">
                        ✓ {success}
                    </div>
                    </FadeUp>
                )}

                {/* Quick actions */}
                <FadeUp delay={0}>
                <div className="grid grid-cols-2 gap-4">
                    <Link href={route('nutriscan.index')} className="flex items-center gap-3 p-4 bg-emerald-500/50 backdrop-blur-md border border-emerald-400/50 rounded-2xl text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400/60 transition-all">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"><Scan className="w-5 h-5" /></div>
                        <div><div className="font-bold text-sm">NutriScan</div><div className="text-xs text-emerald-100">Foto makanan</div></div>
                    </Link>
                    <Link href={route('fitchef.index')} className="flex items-center gap-3 p-4 bg-orange-500/50 backdrop-blur-md border border-orange-400/50 rounded-2xl text-white shadow-lg shadow-orange-500/20 hover:bg-orange-400/60 transition-all">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"><ChefHat className="w-5 h-5" /></div>
                        <div><div className="font-bold text-sm">FitChef</div><div className="text-xs text-orange-100">Buat resep</div></div>
                    </Link>
                </div>
                </FadeUp>

                <FadeUp delay={100}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">

                        {/* Meal type tabs */}
                        <FadeUp delay={150}>
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <div className="grid grid-cols-4 border-b border-gray-100 dark:border-gray-800">
                                {Object.entries(MEAL_META).map(([key, meta]) => {
                                    const Icon  = meta.icon;
                                    const count = (logsByMealType?.[key] ?? []).length;
                                    const active = activeMeal === key;
                                    return (
                                        <button key={key} onClick={() => setActiveMeal(key)}
                                            className={`flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-all border-b-2 ${active ? `${meta.color} border-current` : 'text-gray-400 dark:text-gray-500 border-transparent hover:text-gray-600 dark:hover:text-gray-300'}`}>
                                            <Icon className="w-4 h-4" />
                                            <span className="hidden sm:block">{meta.label}</span>
                                            {count > 0 && <span className="bg-gray-100 dark:bg-gray-800 text-[10px] px-1.5 rounded-full">{count}</span>}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="p-4">
                                {Object.entries(MEAL_META).map(([key, meta]) => {
                                    const isActive = activeMeal === key;
                                    const logs = logsByMealType?.[key] ?? [];
                                    const cals = logs.reduce((s, l) => s + (l.calories || 0), 0);
                                    
                                    return (
                                        <div key={key} className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                            <div className="overflow-hidden">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{meta.label}</span>
                                                    {cals > 0 && <span className="text-xs text-gray-500 dark:text-gray-400">{cals} kkal</span>}
                                                </div>
                                                
                                                {logs.length === 0 ? (
                                                    <div className="py-8 text-center">
                                                        <p className="text-2xl mb-2">🍽️</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada log {meta.label.toLowerCase()}</p>
                                                        <Link href={route('nutriscan.index')} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                                                            <Plus className="w-3 h-3" /> Tambah via NutriScan
                                                        </Link>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2 pb-1">
                                                        {logs.map((log) => (
                                                            <div key={log.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                                                    {log.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{log.name}</div>
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">P {Math.round(log.protein)}g · K {Math.round(log.carbs)}g · L {Math.round(log.fat)}g</div>
                                                                </div>
                                                                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">{log.calories} kkal</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        </FadeUp>

                        {/* Chart */}
                        <FadeUp delay={250}>
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">Tren 7 Hari</span>
                            </div>
                            <div className="h-40"><Line data={chartData} options={chartOptions} /></div>
                        </div>
                        </FadeUp>
                    </div>

                    {/* RIGHT */}
                    <div className="space-y-4">
                        <FadeUp delay={200}>
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white mb-4 text-center">Kalori Hari Ini</div>
                            <CalorieRing current={dailyStats.calories} goal={dailyStats.goal_calories} />
                            <div className="mt-5 space-y-3">
                                {[
                                    { label: 'Protein', value: dailyStats.protein, max: proteinGoal, color: 'bg-blue-500' },
                                    { label: 'Karbo',   value: dailyStats.carbs,   max: carbsGoal,   color: 'bg-amber-500' },
                                    { label: 'Lemak',   value: dailyStats.fat,     max: fatGoal,     color: 'bg-rose-500' },
                                ].map((m, mi) => (
                                    <AnimatedBar key={m.label} label={m.label} value={m.value} max={m.max} color={m.color} delay={mi * 120} />
                                ))}
                            </div>
                        </div>
                        </FadeUp>

                        <FadeUp delay={300}>
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Anggota Keluarga</div>
                            <div className="space-y-2">
                                {(familyMembers ?? []).slice(0, 4).map(m => (
                                    <Link key={m.id} href={route('family.show', m.id)}
                                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center overflow-hidden text-white text-xs font-bold flex-shrink-0 ring-1 ring-emerald-500/20">
                                            {m.display_avatar ? <img src={m.display_avatar} alt="avatar" className="w-full h-full object-cover" /> : m.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{m.name}</div>
                                            {m.age_category && <div className="text-xs text-gray-500 dark:text-gray-400">{m.age_category}</div>}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <button onClick={() => setIsInviteOpen(true)} className="mt-3 w-full flex items-center justify-center gap-1 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-colors">
                                <Plus className="w-3.5 h-3.5" /> Undang Anggota
                            </button>
                        </div>
                        </FadeUp>
                    </div>
                </div>
                </FadeUp>
            </div>

            {/* Invite Modal */}
            <Modal show={isInviteOpen} onClose={() => { setIsInviteOpen(false); resetInvite(); }} maxWidth="md">
                <form onSubmit={submitInvite} className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Undang Anggota Keluarga</h2>
                        <button type="button" onClick={() => { setIsInviteOpen(false); resetInvite(); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Kirimkan undangan ke email anggota keluarga Anda untuk bergabung dan berbagi progress bersama.
                    </p>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Tujuan</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="w-5 h-5 text-gray-400" />
                            </div>
                            <input 
                                type="email" 
                                value={inviteData.email}
                                onChange={e => setInviteData('email', e.target.value)}
                                className="pl-10 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                                placeholder="contoh@email.com"
                                required
                            />
                        </div>
                        {inviteErrors.email && <p className="text-xs text-red-500 mt-1">{inviteErrors.email}</p>}
                    </div>

                    <div className="flex gap-3 justify-end mt-6">
                        <button type="button" onClick={() => { setIsInviteOpen(false); resetInvite(); }} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                            Batal
                        </button>
                        <button type="submit" disabled={inviteProcessing} className="px-5 py-2 bg-emerald-500/50 backdrop-blur-md border border-emerald-400/50 text-white text-sm font-semibold rounded-xl hover:bg-emerald-400/60 shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50">
                            {inviteProcessing ? 'Mengirim...' : 'Kirim Undangan'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
