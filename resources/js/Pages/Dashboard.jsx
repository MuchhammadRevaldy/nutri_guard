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
import recommendedMealsData from '@/data/recommendedMeals.json';

export default function Dashboard({ auth, familyMembers = [], todaysLogs = [], dailyStats, weeklyChartData, success }) {

    const stats = dailyStats || { calories: 0, protein: 0, carbs: 0, fat: 0, goal_calories: 2000 };

    const chartData = weeklyChartData || { labels: [], data: [] };

    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showManageModal, setShowManageModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showRecipeModal, setShowRecipeModal] = useState(false);

    // Recommended meals list for random suggestion (Imported from JSON)
    const recommendedMeals = recommendedMealsData;

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

    const refreshRecommendation = () => {
        const random = recommendedMeals[Math.floor(Math.random() * recommendedMeals.length)];
        setRecommended(random);
    };

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
                        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700/50 hover:border-emerald-500/30 transition-all duration-300">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-gray-400 text-sm font-medium">Today's Recommended Meal</h3>
                                <button
                                    onClick={refreshRecommendation}
                                    className="text-gray-400 hover:text-emerald-400 transition-colors p-1 rounded-full hover:bg-gray-700/50"
                                    title="Get another recommendation"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                    </svg>
                                </button>
                            </div>

                            <div className="relative group">
                                <img
                                    src={recommended.image}
                                    alt={recommended.name}
                                    className="w-full h-40 md:h-44 object-cover rounded-xl mb-4 shadow-sm"
                                />
                            </div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">{recommended.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex gap-2 items-center">
                                <span>{recommended.calories} kcal</span>
                                <span>•</span>
                                <span>{recommended.protein}g Protein</span>
                                <span>•</span>
                                <span>{recommended.time}</span>
                            </div>

                            <button
                                onClick={() => setShowRecipeModal(true)}
                                className="mt-4 block w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full transition-colors text-center"
                            >
                                View Recipe
                            </button>
                        </div>
                    </div>

                </div>

                <InviteMemberModal show={showInviteModal} onClose={() => setShowInviteModal(false)} />
                <ManageMembersModal show={showManageModal} onClose={() => setShowManageModal(false)} members={familyMembers} />

                {/* Recipe Detail Modal */}
                <Modal show={showRecipeModal} onClose={() => setShowRecipeModal(false)}>
                    <div className="p-6 pt-12">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{recommended.name}</h2>
                            <button onClick={() => setShowRecipeModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mb-6">
                            <img src={recommended.image} alt={recommended.name} className="w-full h-56 object-cover rounded-2xl" />
                        </div>

                        <div className="flex gap-4 mb-6">
                            <div className="bg-orange-50 dark:bg-orange-900/30 px-4 py-2 rounded-xl text-center">
                                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{recommended.calories}</div>
                                <div className="text-xs text-orange-600/70 dark:text-orange-400/70 uppercase font-bold">kcal</div>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 rounded-xl text-center">
                                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{recommended.protein}g</div>
                                <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70 uppercase font-bold">Protein</div>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-xl text-center">
                                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{recommended.time}</div>
                                <div className="text-xs text-blue-600/70 dark:text-blue-400/70 uppercase font-bold">Time</div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Ingredients</h3>
                                <ul className="grid grid-cols-2 gap-2">
                                    {recommended.ingredients && recommended.ingredients.map((ing, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                            {ing}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Preparation</h3>
                                <ol className="space-y-3 relative border-l-2 border-gray-100 dark:border-gray-700 ml-3 pl-5">
                                    {recommended.steps && recommended.steps.map((step, idx) => (
                                        <li key={idx} className="relative text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                            <span className="absolute -left-[27px] top-0 w-6 h-6 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold">
                                                {idx + 1}
                                            </span>
                                            {step}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </div>
                </Modal>

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
