import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import WeeklyTrendChart from '@/Components/Charts/WeeklyTrendChart'; // Reuse chart
import DayBreakdown from '@/Components/Report/DayBreakdown';
import TopFoodsList from '@/Components/Report/TopFoodsList';

export default function Report({ auth, weekRange, avgCalories, dailyBreakdown, insights, topFoods }) {

    // Prepare chart data for reusable component
    const chartLabels = dailyBreakdown.map(day => day.date.substring(0, 3)); // Mon, Tue
    const chartValues = dailyBreakdown.map(day => day.total_calories);
    const weeklyChartData = {
        labels: chartLabels,
        data: chartValues
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href={route('dashboard')} className="text-gray-400 hover:text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                            Weekly Report ({weekRange})
                        </h2>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold transition-colors shadow-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download PDF
                    </button>
                </div>
            }
        >
            <Head title="Weekly Report" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Top Section: Chart & Insights */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Weekly Average Chart Card */}
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
                            <div className="mb-6">
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Calorie Intake</div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    Weekly Average: {avgCalories.toLocaleString()} kcal/day
                                </h3>
                                <div className="text-sm text-emerald-500 font-medium">
                                    {weekRange} <span className="text-emerald-600 ml-2">↑ 5% vs last week</span>
                                </div>
                            </div>
                            {/* Height constrained for chart */}
                            <div className="h-64">
                                <WeeklyTrendChart chartData={weeklyChartData} />
                            </div>
                        </div>

                        {/* Weekly Insights */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Weekly Insights</h3>

                                {/* Insight 1 */}
                                <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex gap-4">
                                    <div className="text-emerald-500 mt-1">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    </div>
                                    <div>
                                        <div className="font-bold text-emerald-700 dark:text-emerald-400">Great job!</div>
                                        <div className="text-sm text-emerald-600 dark:text-emerald-300">
                                            You met your protein goal on {insights.daysMetProtein} out of {insights.totalDays} days.
                                        </div>
                                    </div>
                                </div>

                                {/* Insight 2 */}
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex gap-4">
                                    <div className="text-blue-500 mt-1">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                                    </div>
                                    <div>
                                        <div className="font-bold text-blue-700 dark:text-blue-400">Quick Tip</div>
                                        <div className="text-sm text-blue-600 dark:text-blue-300">
                                            Adding a protein shake can help you reach your goals on busy days.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section: Breakdown + Top Foods */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left: Day Breakdown List */}
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Day-by-Day Breakdown</h3>
                            </div>
                            <div>
                                {dailyBreakdown.map((day, ix) => (
                                    <DayBreakdown key={ix} day={day} />
                                ))}
                            </div>
                        </div>

                        {/* Right: Top Foods */}
                        <div>
                            <TopFoodsList foods={topFoods} />
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

import { Link } from '@inertiajs/react';
