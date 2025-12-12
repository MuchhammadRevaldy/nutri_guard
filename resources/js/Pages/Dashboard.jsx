import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import FamilyMemberCircle from '@/Components/Dashboard/FamilyMemberCircle';
import FoodLogItem from '@/Components/Dashboard/FoodLogItem';
import WeeklyTrendChart from '@/Components/Charts/WeeklyTrendChart';
import MacroDonutChart from '@/Components/Charts/MacroDonutChart';
import PrimaryButton from '@/Components/PrimaryButton';
import InviteMemberModal from '@/Components/Modals/InviteMemberModal';
import ManageMembersModal from '@/Components/Modals/ManageMembersModal';
import Modal from '@/Components/Modal';

export default function Dashboard({ auth, familyMembers = [], todaysLogs = [], dailyStats, weeklyChartData, success }) {

    // Default stats if empty or undefined
    const stats = dailyStats || { calories: 0, protein: 0, carbs: 0, fat: 0, goal_calories: 2000 };

    // Default chart data if undefined
    const chartData = weeklyChartData || { labels: [], data: [] };

    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showManageModal, setShowManageModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Recommended meals list for random suggestion
    const recommendedMeals = [
        {
            name: 'Grilled Chicken Salad',
            calories: 450,
            protein: 40,
            image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop'
        },
        {
            name: 'Tofu Veggie Bowl',
            calories: 420,
            protein: 32,
            image: 'https://images.unsplash.com/photo-1512621776951-4471f7d3e8b2?q=80&w=1200&auto=format&fit=crop'
        },
        {
            name: 'Salmon Quinoa Plate',
            calories: 520,
            protein: 45,
            image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop'
        },
        {
            name: 'Beef Stir Fry',
            calories: 560,
            protein: 42,
            image: 'https://images.unsplash.com/photo-1543352634-8732ed2b31f5?q=80&w=1200&auto=format&fit=crop'
        }
    ];

    const [recommended, setRecommended] = useState(recommendedMeals[0]);
    const hasLogs = Array.isArray(todaysLogs) && todaysLogs.length > 0;
    const hasFamily = Array.isArray(familyMembers) && familyMembers.length > 0;

    useEffect(() => {
        if (success) {
            setShowSuccessModal(true);
        }
    }, [success]);

    // Randomize today's recommended meal on load
    useEffect(() => {
        const idx = Math.floor(Math.random() * recommendedMeals.length);
        setRecommended(recommendedMeals[idx]);
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="px-6 space-y-8">

                    {/* 1. Family Monitoring Section */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-2xl p-6 relative">
                        {/* Header with Settings Button */}
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Family Monitoring</h3>
                            <button
                                onClick={() => setShowManageModal(true)}
                                className="flex items-center space-x-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <span className="text-sm font-medium">Edit</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </button>
                        </div>

                        {/* Family List - Added p-4 to fix clipping issues */}
                        <div className="flex items-center space-x-8 overflow-x-auto p-4 -mx-4">
                            {hasFamily ? (
                                familyMembers.map((member, index) => (
                                    <FamilyMemberCircle
                                        key={member.id}
                                        name={member.name}
                                        active={index === 0} // Highlight first one for now
                                        ageCategory={member.age_category}
                                    />
                                ))
                            ) : (
                                <div className="text-sm text-gray-500 italic px-2">No members yet</div>
                            )}

                            {/* Add Member Button */}
                            <div
                                className="flex flex-col items-center space-y-2 cursor-pointer opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
                                onClick={() => setShowInviteModal(true)}
                            >
                                <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-400 dark:border-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-500">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <span className="text-xs font-medium text-gray-500">Add New</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href={route('nutriscan.index')} className="flex items-center justify-center gap-3 p-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/30 transition-all transform hover:scale-[1.02]">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div className="text-left">
                                <div className="font-bold text-lg">Scan Food</div>
                                <div className="text-sm opacity-90">Log your meal with a photo</div>
                            </div>
                        </Link>

                        <Link href={route('fitchef.index')} className="flex items-center justify-center gap-3 p-6 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl shadow-lg shadow-orange-500/30 transition-all transform hover:scale-[1.02]">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            <div className="text-left">
                                <div className="font-bold text-lg">Generate Recipe</div>
                                <div className="text-sm opacity-90">AI-powered meal suggestions</div>
                            </div>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* 3. Weekly Trends Chart */}
                        {/* 3. Weekly Trends Chart */}
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm relative">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Weekly Trends</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total calorie intake</p>
                                </div>
                                <Link href={route('report')} className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-1.5 rounded-full transition-colors font-medium text-gray-600 dark:text-gray-300">
                                    View Details &rarr;
                                </Link>
                            </div>
                            <WeeklyTrendChart chartData={chartData} />
                        </div>

                        {/* 4. Macro Nutrients */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Protein</div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(stats.protein)}g <span className="text-sm font-normal text-gray-400">/ 110g</span></div>
                                </div>
                                <MacroDonutChart value={stats.protein} total={110} color="#059669" />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Carbs</div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(stats.carbs)}g <span className="text-sm font-normal text-gray-400">/ 250g</span></div>
                                </div>
                                <MacroDonutChart value={stats.carbs} total={250} color="#f97316" />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Fat</div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(stats.fat)}g <span className="text-sm font-normal text-gray-400">/ 70g</span></div>
                                </div>
                                <MacroDonutChart value={stats.fat} total={70} color="#3b82f6" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* 5. Today's Log */}
                        <div className={`lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm ${hasLogs ? '' : 'min-h-64'}`}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Today's Log</h3>
                                <div className="text-sm font-bold text-gray-900 dark:text-white">{stats.calories} <span className="text-gray-400 font-normal">/ {stats.goal_calories}</span> kcal</div>
                            </div>

                            <div className={`${hasLogs ? 'space-y-2' : 'space-y-2 h-full flex items-center justify-center'}`}>
                                {hasLogs ? (
                                    todaysLogs.map((log) => (
                                        <FoodLogItem
                                            key={log.id}
                                            name={log.name}
                                            calories={log.calories}
                                            time={log.eaten_at}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500">No meals logged today yet.</div>
                                )}
                            </div>
                        </div>

                        {/* 6. Recommended Meal */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Today's Recommended Meal</h3>

                            <img
                                src={recommended.image}
                                alt={recommended.name}
                                className="w-full h-40 md:h-44 object-cover rounded-xl mb-4 shadow-sm"
                            />
                            <div className="text-lg font-bold text-gray-900 dark:text-white">{recommended.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{recommended.calories} kcal • {recommended.protein}g Protein</div>

                            <Link
                                href={route('fitchef.index')}
                                className="mt-4 block w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full transition-colors text-center"
                            >
                                View Recipe
                            </Link>
                        </div>
                    </div>

                </div>

                <InviteMemberModal show={showInviteModal} onClose={() => setShowInviteModal(false)} />
                <ManageMembersModal show={showManageModal} onClose={() => setShowManageModal(false)} members={familyMembers} />

                {/* Success Modal */}
                {/* Custom Modal for Flash Messages */}
                <Modal show={showSuccessModal} onClose={() => setShowSuccessModal(false)} maxWidth="sm">
                    <div className="p-6 text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-6">
                            <svg className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Saved!</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">{success}</p>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors"
                        >
                            Awesome
                        </button>
                    </div>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}
