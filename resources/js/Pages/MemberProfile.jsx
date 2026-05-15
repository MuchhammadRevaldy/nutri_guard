import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Line } from 'react-chartjs-2';
import FadeUp from '@/Components/FadeUp';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

function DayDropdown({ date, dayName, logs, defaultOpen, delay }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl group"
            style={{ animation: `cardSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}ms both` }}
        >
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 cursor-pointer focus:outline-none">
                <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${logs.length > 0 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {dayName}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                        {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{logs.length} Meals</span>
                    <svg className={`w-5 h-5 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>
            <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3">
                        {logs.length > 0 ? (
                            <div className="space-y-3">
                                {logs.map((log, li) => (
                                    <div key={log.id}
                                        className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                                        style={{ animation: isOpen ? `cardSlideUp 0.4s cubic-bezier(0.22,1,0.36,1) ${li * 60}ms both` : 'none' }}
                                    >
                                        <div className="flex items-start gap-2.5">
                                            <div className="text-gray-400 text-[10px] font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5">
                                                {new Date(log.eaten_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm text-gray-900 dark:text-white truncate">{log.name}</div>
                                                <div className="text-xs text-gray-400 mt-0.5">
                                                    {Math.round(log.calories)} kkal • {log.protein}g P • {log.carbs}g K • {log.fat}g L
                                                </div>
                                                {log.tags && log.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                                        {log.tags.slice(0, 3).map((tag, tIdx) => (
                                                            <span key={tIdx} className={`text-[10px] px-1.5 py-0.5 rounded ${
                                                                tag.includes('Iron') ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                                                : tag.includes('Protein') ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400'
                                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
                                                            }`}>{tag}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-sm text-gray-400">
                                No meals recorded for this day.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MemberProfile({ auth, member, alerts, weeklyLogs, growthHistory }) {

    const latestGrowth = growthHistory?.[0] || {};
    const previousGrowth = growthHistory?.[1] || {};
    
    const latestHeight = latestGrowth.height || '-';
    const latestWeight = latestGrowth.weight || '-';
    
    const heightDiff = previousGrowth.height ? (latestGrowth.height - previousGrowth.height).toFixed(1) : 0;
    const weightDiff = previousGrowth.weight ? (latestGrowth.weight - previousGrowth.weight).toFixed(1) : 0;

    // Chart Data Processing
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // 1. Calorie Intake Chart
    const calorieData = days.map(day => {
        const logs = weeklyLogs[day] || [];
        return logs.reduce((sum, log) => sum + (parseFloat(log.calories) || 0), 0);
    });

    const calorieChartData = {
        labels: days,
        datasets: [
            {
                label: 'Calorie Intake (kcal)',
                data: calorieData,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#10b981',
            },
        ],
    };

    // 2. Protein Intake Chart
    const proteinData = days.map(day => {
        const logs = weeklyLogs[day] || [];
        return logs.reduce((sum, log) => sum + (parseFloat(log.protein) || 0), 0);
    });

    const proteinChartData = {
        labels: days,
        datasets: [
            {
                label: 'Protein Intake (g)',
                data: proteinData,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#3b82f6',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        animation: {
            duration: 2000,
            easing: 'easeOutQuart'
        },
        plugins: {
            legend: { display: false },
        },
        scales: {
            y: { beginAtZero: true, grid: { color: '#e5e7eb' } },
            x: { grid: { display: false } }
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <Link href={route('dashboard')} className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h2 className="font-semibold text-base sm:text-xl text-gray-800 dark:text-gray-200 leading-tight truncate">
                        <span className="hidden sm:inline">Family Dashboard <span className="text-gray-400 mx-1">&gt;</span></span>
                        {member.name}
                    </h2>
                </div>
            }
        >
            <Head title={`${member.name} - Profile`} />

            <div className="py-4 sm:py-8 text-gray-900 dark:text-white">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-8">

                    {/* 1. Header Card */}
                    <FadeUp delay={0}>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm">
                        {/* Profile info row */}
                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center border-4 border-white dark:border-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden text-white font-bold text-xl">
                                {member.display_avatar ? (
                                    <img src={member.display_avatar} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    member.name.substring(0, 2).toUpperCase()
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-xl sm:text-3xl font-bold truncate">{member.name}</h1>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        {new Date().getFullYear() - new Date(member.birth_date).getFullYear()} thn
                                    </span>
                                    <span className="text-gray-300 dark:text-gray-600">·</span>
                                    <span className="capitalize">{member.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                        Sehat
                                    </span>
                                    {member.health_goal && (
                                        <span className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 text-xs px-2.5 py-1 rounded-full capitalize">
                                            {member.health_goal.replace('_', ' ')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats row — scrollable on mobile, grid on desktop */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            {[
                                {
                                    label: 'Tinggi', value: latestHeight, unit: 'cm',
                                    diff: heightDiff, goodDir: 'up',
                                    color: heightDiff > 0 ? 'text-emerald-600 dark:text-emerald-400' : heightDiff < 0 ? 'text-orange-500' : 'text-gray-400'
                                },
                                {
                                    label: 'Berat', value: latestWeight, unit: 'kg',
                                    diff: weightDiff, goodDir: 'down',
                                    color: weightDiff < 0 ? 'text-emerald-600 dark:text-emerald-400' : weightDiff > 0 ? 'text-orange-500' : 'text-gray-400'
                                },
                            ].map(({ label, value, unit, diff, color }) => (
                                <div key={label} className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-xl">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">{label}</div>
                                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                        {value} <span className="text-xs sm:text-sm font-normal text-gray-400">{unit}</span>
                                    </div>
                                    <div className={`text-xs mt-1 flex items-center gap-0.5 ${color}`}>
                                        {diff > 0
                                            ? <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7 7 7" /></svg>
                                            : diff < 0
                                            ? <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7-7-7" /></svg>
                                            : <span>—</span>}
                                        <span>{diff != 0 ? Math.abs(diff) + unit : 'Stabil'}</span>
                                        <span className="text-gray-400 ml-1">bln lalu</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    </FadeUp>

                    {/* 2. Health Insights & Alerts */}
                    <FadeUp delay={100}>
                    <div>
                        <h3 className="text-base sm:text-lg font-bold mb-3">Insights Kesehatan</h3>
                        <div className="space-y-2.5">
                            {alerts.length === 0 ? (
                                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-4 rounded-xl flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <div>
                                        <div className="font-semibold text-sm">Semua Baik!</div>
                                        <div className="text-xs opacity-80 mt-0.5">Tidak ada risiko kesehatan yang terdeteksi.</div>
                                    </div>
                                </div>
                            ) : (
                                alerts.map((alert, idx) => (
                                    <div key={idx} className={`p-4 rounded-xl border flex items-start gap-3 ${
                                        alert.type === 'critical'
                                        ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400'
                                        : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400'
                                    }`}>
                                        <div className="flex-shrink-0 mt-0.5">
                                            {alert.type === 'critical'
                                                ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                            }
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-semibold text-sm">{alert.title}</div>
                                            <div className="text-xs opacity-90 mt-0.5 leading-relaxed">{alert.message}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    </FadeUp>

                    {/* 3. Charts Section */}
                    <FadeUp delay={180}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-sm sm:text-base">Asupan Kalori</h3>
                                <span className="text-xs text-emerald-500 font-medium">kkal/hari</span>
                            </div>
                            <div className="h-48 sm:h-64">
                                <Line data={calorieChartData} options={chartOptions} />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-sm sm:text-base">Asupan Protein</h3>
                                <span className="text-xs text-blue-500 font-medium">gram/hari</span>
                            </div>
                            <div className="h-48 sm:h-64">
                                <Line data={proteinChartData} options={chartOptions} />
                            </div>
                        </div>
                    </div>
                    </FadeUp>

                    {/* 4. Weekly Nutrition Log (Dropdown Day-by-Day) */}
                    <FadeUp delay={260}>
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-sm sm:text-base">Riwayat Makan</h3>
                        </div>
                        <div className="space-y-3">
                            {/* Iterate over last 7 days logically to ensure order */}
                            {Array.from({ length: 7 }).map((_, i) => {
                                const date = new Date();
                                date.setDate(date.getDate() - i);
                                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue...
                                const logs = weeklyLogs[dayName] || [];

                                return (
                                    <DayDropdown
                                        key={i}
                                        date={date}
                                        dayName={dayName}
                                        logs={logs}
                                        defaultOpen={i === 0}
                                        delay={i * 70}
                                    />
                                );
                            })}
                        </div>
                    </div>
                    </FadeUp>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
