import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { CheckCircle, AlertTriangle, RefreshCw, Circle, Fish, Leaf, Beef, ChefHat, Zap, Sparkles, Carrot, Soup, Coffee, Edit3 } from 'lucide-react';
import MealSelectorModal from '@/Components/Modals/MealSelectorModal';
import { RECOMMENDATIONS } from '@/Data/RecommendedMeals'; // Import our new data

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function MealPlanner({ auth }) {
    // Custom Scrollbar Styles
    const scrollbarStyles = `
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: rgba(156, 163, 175, 0.5);
            border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: rgba(107, 114, 128, 0.8);
        }
        .custom-scrollbar::-webkit-scrollbar-button {
            display: none;
        }
    `;

    // 2. STATE MANAGEMENT
    // Initial state: Pre-fill with first 7 items from RECOMMENDATIONS
    const [weeklyPlan, setWeeklyPlan] = useState(() => {
        return DAYS.map((day, index) => ({
            day: day,
            meal: RECOMMENDATIONS[index % 10] // Just pick first 10 nicely
        }));
    });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDayIndex, setSelectedDayIndex] = useState(null);

    // 3. CORE FUNCTIONS

    // A. Dynamic Stats Calculation
    const { totalBudget, proteinScore, scoreChange } = useMemo(() => {
        let budget = 0;
        let safeDays = 0;

        weeklyPlan.forEach((plan) => {
            if (!plan.meal) return;
            budget += plan.meal.price;

            const tags = plan.meal.tags || [];
            const isSafe = tags.some(t =>
                t.includes('Animal') ||
                t.includes('Fish') ||
                t.includes('Omega') ||
                t.includes('Seafood') ||
                (t.includes('Protein') && !t.includes('Plant'))
            );
            if (isSafe) safeDays++;
        });

        const score = Math.round((safeDays / 7) * 100);
        const change = Math.floor(Math.random() * 5) + 1; // Mock change

        return { totalBudget: budget, proteinScore: score, scoreChange: change };
    }, [weeklyPlan]);

    // B. Generate Logic
    const handleGeneratePlan = () => {
        const shuffled = [...RECOMMENDATIONS].sort(() => 0.5 - Math.random());
        const newPlan = DAYS.map((day, index) => ({
            day: day,
            meal: shuffled[index % shuffled.length]
        }));
        setWeeklyPlan(newPlan);
    };

    // Modal Handlers
    const openMealSelector = (index) => {
        setSelectedDayIndex(index);
        setIsModalOpen(true);
    };

    const handleSelectMeal = (meal) => {
        if (selectedDayIndex !== null) {
            const newPlan = [...weeklyPlan];
            newPlan[selectedDayIndex].meal = meal;
            setWeeklyPlan(newPlan);
        }
        setIsModalOpen(false);
        setSelectedDayIndex(null);
    };

    // Helper functions
    const getDailyStatus = (tags) => {
        if (!tags) return 'warning';
        const isSafe = tags.some(t => t.includes('Animal') || t.includes('Fish') || t.includes('Omega') || t.includes('Seafood') || (t.includes('Protein') && !t.includes('Plant')));
        return isSafe ? 'safe' : 'warning';
    };

    const getIconElement = (code) => {
        const props = "w-6 h-6";
        // Map icon codes from RECOMMENDATIONS
        switch (code) {
            case 'beef': return <Beef className={`${props} text-red-600`} />;
            case 'fish': return <Fish className={`${props} text-blue-600`} />;
            case 'egg': return <Circle className={`${props} text-yellow-600`} />;
            case 'chicken': return <ChefHat className={`${props} text-orange-600`} />;
            case 'carrot': return <Carrot className={`${props} text-orange-500`} />;
            case 'soup': return <Soup className={`${props} text-amber-600`} />;
            case 'coffee': return <Coffee className={`${props} text-amber-700`} />;
            default: return <Leaf className={`${props} text-green-600`} />;
        }
    };

    const getTagIcon = (tag) => {
        if (tag.includes('Animal') || tag.includes('Beef')) return <Beef className="w-3 h-3" />;
        if (tag.includes('Fish') || tag.includes('Omega') || tag.includes('Seafood')) return <Fish className="w-3 h-3" />;
        if (tag.includes('Plant') || tag.includes('Fiber') || tag.includes('Vegetable') || tag.includes('Vitamin')) return <Leaf className="w-3 h-3" />;
        if (tag.includes('Iron')) return <Zap className="w-3 h-3" />;
        if (tag.includes('MPASI')) return <Circle className="w-3 h-3" />;
        return <Circle className="w-3 h-3" />;
    };

    const formatRp = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num).replace('Rp', 'Rp ');
    };

    const boosters = [
        { name: 'Chicken Liver', benefit: 'High Iron', icon: <Beef className="w-4 h-4 text-emerald-600" />, color: 'bg-emerald-100' },
        { name: 'Catfish (Lele)', benefit: 'High Protein', icon: <Fish className="w-4 h-4 text-gray-600" />, color: 'bg-gray-100' },
        { name: 'Tempeh', benefit: 'Plant Iron', icon: <Leaf className="w-4 h-4 text-gray-600" />, color: 'bg-gray-100' },
        { name: 'Spinach', benefit: 'Vitamin A', icon: <Leaf className="w-4 h-4 text-emerald-600" />, color: 'bg-emerald-100' },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Family Growth Plan</h2>}
        >
            <Head title="Family Growth Plan" />
            <style>{scrollbarStyles}</style>

            <div className="h-[calc(100vh-8.5rem)] flex gap-4 py-4 overflow-hidden text-gray-800 font-sans">

                {/* LEFT CONTENT AREA */}
                <div className="flex-1 flex flex-col gap-4 min-w-0 h-full">

                    {/* Top Stats Cards */}
                    <div className="shrink-0 grid grid-cols-2 gap-4 h-32">
                        {/* Protein Score */}
                        <div className="bg-white dark:bg-gray-800 rounded-[1.5rem] p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center h-full relative overflow-hidden group">
                            <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Beef className="w-32 h-32" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-widest mb-0.5">Protein Score</h3>
                                <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-0.5">{proteinScore}%</div>
                                <div className="text-emerald-500 font-bold text-[10px] bg-emerald-50 w-fit px-2 py-0.5 rounded-full">+{scoreChange}% vs last week</div>
                            </div>
                        </div>

                        {/* Budget Est */}
                        <div className="bg-white dark:bg-gray-800 rounded-[1.5rem] p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center h-full relative overflow-hidden group">
                            <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity">
                                <RefreshCw className="w-32 h-32" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-widest mb-0.5">Budget Est</h3>
                                <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-0.5 leading-tight">
                                    {formatRp(totalBudget).replace(',00', '')}
                                </div>
                                <div className="text-red-500 font-bold text-[10px] bg-red-50 w-fit px-2 py-0.5 rounded-full">based on market avg</div>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Schedule Grid */}
                    <div className="flex-1 min-h-0 bg-white dark:bg-gray-800 rounded-[1.5rem] border border-gray-100 dark:border-gray-700 p-3 flex flex-col shadow-sm">

                        <div className="flex-1 overflow-x-auto custom-scrollbar flex items-stretch pb-1">
                            <div className="flex gap-3 min-w-max h-full">
                                {weeklyPlan.map((plan, idx) => {
                                    const status = getDailyStatus(plan.meal.tags);
                                    return (
                                        <div key={idx} className="w-48 flex flex-col h-full">
                                            {/* Day Header */}
                                            <div className="text-gray-400 font-bold mb-2 uppercase text-[10px] tracking-widest text-center">
                                                {plan.day}
                                            </div>

                                            {/* Menu Card - INTERACTIVE */}
                                            {/* Added onClick listener to open modal */}
                                            <button
                                                onClick={() => openMealSelector(idx)}
                                                className={`flex-1 rounded-2xl p-4 w-full text-left ${status === 'safe' ? 'bg-gray-50 dark:bg-gray-700/30' : 'bg-amber-50 dark:bg-amber-900/20'} flex flex-col relative group transition-all hover:bg-opacity-80 hover:shadow-md cursor-pointer border border-transparent hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                                            >
                                                {/* Hover Edit Icon */}
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 p-1.5 rounded-full shadow-sm text-emerald-600">
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </div>

                                                <div className="flex-1 text-center flex flex-col items-center justify-center">
                                                    <div className="mb-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                                                        {getIconElement(plan.meal.iconCode)}
                                                    </div>
                                                    <div className="font-bold text-base text-gray-900 dark:text-white leading-tight line-clamp-2 mb-1">
                                                        {plan.meal.name}
                                                    </div>
                                                </div>

                                                {/* Tags */}
                                                <div className="flex flex-wrap justify-center gap-2 mt-3 w-full">
                                                    {plan.meal.tags.slice(0, 3).map((tag, tIdx) => ( // limit to 3 tags for layout safety
                                                        <span key={tIdx} className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm max-w-full truncate ${tag.includes('Animal') ? 'bg-emerald-100 text-emerald-800' :
                                                                tag.includes('Iron') ? 'bg-orange-100 text-orange-800' :
                                                                    tag.includes('Omega') ? 'bg-blue-100 text-blue-800' :
                                                                        'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {getTagIcon(tag)} {tag.replace('Animal Protein', 'Animal')}
                                                        </span>
                                                    ))}
                                                    {plan.meal.tags.includes('MPASI') && (
                                                        <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-100 text-blue-800 shadow-sm">
                                                            👶 MPASI
                                                        </span>
                                                    )}
                                                </div>
                                            </button>

                                            {/* Bottom Status Indicator */}
                                            <div className={`mt-2 py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wide ${status === 'safe'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                {status === 'safe'
                                                    ? <><CheckCircle className="w-3 h-3 shrink-0" /> Safe</>
                                                    : <><AlertTriangle className="w-3 h-3 shrink-0" /> Low Prot</>
                                                }
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                </div>

                {/* RIGHT SIDEBAR - Budget Growth Boosters */}
                <div className="w-[18rem] shrink-0 h-full bg-white dark:bg-gray-800 rounded-[1.5rem] p-5 shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-500" />
                        Budget Boosters
                    </h3>

                    <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
                        {boosters.map((booster, idx) => (
                            <div key={idx} className={`p-3 rounded-2xl flex items-center gap-3 transition-transform hover:scale-[1.02] cursor-pointer border border-transparent ${idx === 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100' : 'bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100'
                                }`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${booster.color}`}>
                                    {booster.icon}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white text-sm">{booster.name}</div>
                                    <div className="text-[10px] text-gray-500">{booster.benefit}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button
                            onClick={handleGeneratePlan}
                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all transform hover:scale-[1.02] active:scale-95 text-sm flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Generate Plan
                        </button>
                    </div>
                </div>

            </div>

            {/* MEAL SELECTION MODAL */}
            <MealSelectorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={handleSelectMeal}
                currentDay={selectedDayIndex !== null ? weeklyPlan[selectedDayIndex].day : ''}
            />
        </AuthenticatedLayout>
    );
}
