import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, BarElement, Filler, Tooltip, Legend
} from 'chart.js';
import { TrendingUp, Target, Award, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend);

export default function Report({ auth, weekRange, avgCalories, dailyBreakdown, insights, topFoods }) {
    const labels      = dailyBreakdown.map(d => d.date);
    const calData     = dailyBreakdown.map(d => d.total_calories);
    const targetData  = dailyBreakdown.map(d => d.target_calories);
    const proteinData = dailyBreakdown.map(d => d.macros.protein);
    const carbsData   = dailyBreakdown.map(d => d.macros.carbs);
    const fatData     = dailyBreakdown.map(d => d.macros.fat);

    const lineChart = {
        labels,
        datasets: [
            { label: 'Kalori', data: calData, fill: true, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.07)', tension: 0.4, pointBackgroundColor: '#10b981', pointRadius: 4 },
            { label: 'Target', data: targetData, borderColor: '#e5e7eb', borderDash: [5, 5], tension: 0, pointRadius: 0 },
        ],
    };

    const barChart = {
        labels,
        datasets: [
            { label: 'Protein', data: proteinData, backgroundColor: 'rgba(59,130,246,0.7)',  borderRadius: 4 },
            { label: 'Karbo',   data: carbsData,   backgroundColor: 'rgba(245,158,11,0.7)',  borderRadius: 4 },
            { label: 'Lemak',   data: fatData,      backgroundColor: 'rgba(239,68,68,0.7)',   borderRadius: 4 },
        ],
    };

    const chartOpts = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 10 } } },
            y: { grid: { color: 'rgba(156,163,175,0.1)' }, ticks: { color: '#9ca3af', font: { size: 10 } }, beginAtZero: true },
        },
    };

    const barOpts = {
        ...chartOpts,
        plugins: { legend: { display: true, position: 'bottom', labels: { color: '#9ca3af', font: { size: 10 }, boxWidth: 10 } } },
    };

    function exportPDF() {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Laporan Nutrisi Mingguan', 14, 20);
        doc.setFontSize(10);
        doc.text(`Periode: ${weekRange}`, 14, 28);
        doc.text(`Rata-rata kalori: ${avgCalories} kkal/hari`, 14, 34);
        doc.autoTable({
            startY: 42,
            head: [['Tanggal', 'Kalori', 'Target', 'Protein', 'Karbo', 'Lemak']],
            body: dailyBreakdown.map(d => [d.date, d.total_calories, d.target_calories, Math.round(d.macros.protein) + 'g', Math.round(d.macros.carbs) + 'g', Math.round(d.macros.fat) + 'g']),
            styles: { fontSize: 9 },
        });
        doc.save(`laporan-nutrisi-${weekRange.replace(/\s/g, '-')}.pdf`);
    }

    return (
        <AuthenticatedLayout user={auth.user} header="Laporan Mingguan">
            <Head title="Laporan" />
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Minggu ini</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{weekRange}</p>
                    </div>
                    <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors">
                        <Download className="w-4 h-4" /> PDF
                    </button>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Rata-rata', value: avgCalories.toLocaleString('id-ID'), unit: 'kkal/hari', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                        { label: 'Target Protein', value: `${insights.daysMetProtein}/${insights.totalDays}`, unit: 'hari tercapai', icon: Target, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                        { label: 'Hari Aktif', value: dailyBreakdown.filter(d => d.total_calories > 0).length, unit: `dari ${insights.totalDays} hari`, icon: Award, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
                    ].map(s => {
                        const Icon = s.icon;
                        return (
                            <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
                                <Icon className={`w-5 h-5 ${s.color} mb-2`} />
                                <div className="text-xl font-extrabold text-gray-900 dark:text-white">{s.value}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{s.unit}</div>
                                <div className="text-[10px] text-gray-400 mt-0.5">{s.label}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Calorie trend chart */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Tren Kalori vs Target</h3>
                    <div className="h-52"><Line data={lineChart} options={{ ...chartOpts, plugins: { legend: { display: true, position: 'bottom', labels: { color: '#9ca3af', font: { size: 10 }, boxWidth: 10 } } } }} /></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Macro breakdown */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Breakdown Makro Harian</h3>
                        <div className="h-52"><Bar data={barChart} options={barOpts} /></div>
                    </div>

                    {/* Top foods */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Makanan Sering</h3>
                        <div className="space-y-3">
                            {Object.entries(topFoods ?? {}).slice(0, 5).map(([name, count], i) => (
                                <div key={name} className="flex items-center gap-3">
                                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                        {i + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{count}× minggu ini</div>
                                    </div>
                                </div>
                            ))}
                            {Object.keys(topFoods ?? {}).length === 0 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Belum ada data</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Daily breakdown table */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Detail Per Hari</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-800">
                                    {['Tanggal', 'Kalori', 'Target', 'Protein', 'Karbo', 'Lemak', 'Status'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {dailyBreakdown.map((d, i) => {
                                    const pct    = d.target_calories > 0 ? (d.total_calories / d.target_calories) * 100 : 0;
                                    const status = d.total_calories === 0 ? 'Tidak ada data' : pct > 115 ? 'Melebihi' : pct >= 80 ? 'Tercapai' : 'Kurang';
                                    const scls   = status === 'Tercapai' ? 'text-emerald-600 dark:text-emerald-400' : status === 'Melebihi' ? 'text-red-500' : status === 'Kurang' ? 'text-amber-500' : 'text-gray-400';
                                    return (
                                        <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{d.date}</td>
                                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{d.total_calories}</td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{d.target_calories}</td>
                                            <td className="px-4 py-3 text-blue-600 dark:text-blue-400">{Math.round(d.macros.protein)}g</td>
                                            <td className="px-4 py-3 text-amber-600 dark:text-amber-400">{Math.round(d.macros.carbs)}g</td>
                                            <td className="px-4 py-3 text-rose-600 dark:text-rose-400">{Math.round(d.macros.fat)}g</td>
                                            <td className="px-4 py-3"><span className={`text-xs font-semibold ${scls}`}>{status}</span></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
