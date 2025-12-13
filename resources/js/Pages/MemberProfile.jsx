import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Line } from 'react-chartjs-2';
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

export default function MemberProfile({ auth, member, alerts, weeklyLogs, growthHistory }) {

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
                <div className="flex items-center gap-4">
                    <Link href={route('dashboard')} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Family Dashboard <span className="text-gray-400 mx-2">&gt;</span> {member.name}
                    </h2>
                </div>
            }
        >
            <Head title={`${member.name} - Profile`} />

            <div className="py-8 text-gray-900 dark:text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

                    {/* 1. Header Card */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-3xl border-4 border-white dark:border-gray-800 ring-1 ring-gray-200 dark:ring-gray-700">
                                👨🏾
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{member.name}</h1>
                                <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mt-1">
                                    <span>🎂 {new Date().getFullYear() - new Date(member.birth_date).getFullYear()} Years old</span>
                                    <span>•</span>
                                    <span>♂ {member.gender === 'male' ? 'Male' : 'Female'}</span>
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <span className="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        Healthy
                                    </span>
                                    {member.health_goal && (
                                        <span className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 text-xs px-2 py-1 rounded-md capitalize">
                                            {member.health_goal.replace('_', ' ')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-6">
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl min-w-[120px]">
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Height</div>
                                <div className="text-2xl font-bold">{member.height} <span className="text-sm font-normal text-gray-500">cm</span></div>
                                <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                    0.5cm <span className="text-gray-500 ml-1">last mo.</span>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl min-w-[120px]">
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Weight</div>
                                <div className="text-2xl font-bold">{member.weight} <span className="text-sm font-normal text-gray-500">kg</span></div>
                                <div className="text-xs text-orange-500 dark:text-orange-400 mt-1 flex items-center">
                                    <span className="mr-1">—</span>
                                    Stable <span className="text-gray-500 ml-1">last mo.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Health Insights & Alerts */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Health Insights & Alerts</h3>
                        <div className="space-y-3">
                            {alerts.length === 0 ? (
                                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-4 rounded-xl flex items-center gap-4 text-emerald-700 dark:text-emerald-400">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <div>
                                        <div className="font-bold">All Good!</div>
                                        <div className="text-sm opacity-80">No health risks detected based on recent data.</div>
                                    </div>
                                </div>
                            ) : (
                                alerts.map((alert, idx) => (
                                    <div key={idx} className={`p-4 rounded-xl border flex items-start gap-4 ${alert.type === 'critical'
                                        ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-500'
                                        : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-500'
                                        }`}>
                                        <div className="mt-1">
                                            {alert.type === 'critical'
                                                ? <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                : <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                            }
                                        </div>
                                        <div>
                                            <div className="font-bold">{alert.title}</div>
                                            <div className="text-sm opacity-90">{alert.message}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* 3. Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Calorie Chart */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg">Calorie Intake</h3>
                                <div className="text-xs text-emerald-500 font-medium">kcal / day</div>
                            </div>
                            <div className="h-64">
                                <Line data={calorieChartData} options={chartOptions} />
                            </div>
                        </div>

                        {/* Protein Chart */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg">Protein Intake</h3>
                                <div className="flex items-center gap-2 text-xs text-blue-500 font-medium">
                                    grams / day
                                </div>
                            </div>
                            <div className="h-64">
                                <Line data={proteinChartData} options={chartOptions} />
                            </div>
                        </div>
                    </div>

                    {/* 4. Weekly Nutrition Log (Dropdown Day-by-Day) */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Recent Meals</h3>
                        </div>
                        <div className="space-y-3">
                            {/* Iterate over last 7 days logically to ensure order */}
                            {Array.from({ length: 7 }).map((_, i) => {
                                const date = new Date();
                                date.setDate(date.getDate() - i);
                                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue...
                                const logs = weeklyLogs[dayName] || [];

                                return (
                                    <details key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl group" open={i === 0}>
                                        <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none">
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
                                                <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </summary>
                                        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3">
                                            {logs.length > 0 ? (
                                                <div className="space-y-3">
                                                    {logs.map(log => (
                                                        <div key={log.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <div className="text-gray-400 text-xs font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                                                    {new Date(log.eaten_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-sm text-gray-900 dark:text-white">{log.name}</div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {Math.round(log.calories)} kcal • {log.protein}g P • {log.carbs}g C • {log.fat}g F
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1 justify-end max-w-[40%]">
                                                                {log.tags && log.tags.map((tag, tIdx) => (
                                                                    <span key={tIdx} className={`text-[10px] px-1.5 py-0.5 rounded truncate max-w-full ${tag.includes('Iron') ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                                                                        tag.includes('Protein') ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400' :
                                                                            'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                                                        }`}>
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 text-sm text-gray-400 italic">
                                                    No meals recorded for this day.
                                                </div>
                                            )}
                                        </div>
                                    </details>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
