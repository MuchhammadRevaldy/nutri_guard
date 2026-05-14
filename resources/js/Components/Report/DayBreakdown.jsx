import { useState } from 'react';
import { Transition } from '@headlessui/react';

export default function DayBreakdown({ day }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 last:border-0">
            {/* Header / Summary Row */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-4 w-full">
                    <span className="font-medium text-gray-900 dark:text-white w-24">{day.date}</span>

                    {/* Progress Bar (Calories) */}
                    <div className="flex-1 max-w-xs h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.min((day.total_calories / (day.target_calories || 2000)) * 100, 100)}%` }}
                        ></div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-white">{day.total_calories} <span className="text-gray-400 font-normal text-sm">/ {day.target_calories}</span> kcal</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>

            {/* Detailed Content */}
            <Transition
                show={isOpen}
                enter="transition-all duration-300 ease-out"
                enterFrom="opacity-0 -translate-y-4 max-h-0"
                enterTo="opacity-100 translate-y-0 max-h-screen"
                leave="transition-all duration-200 ease-in"
                leaveFrom="opacity-100 translate-y-0 max-h-screen"
                leaveTo="opacity-0 -translate-y-4 max-h-0"
            >
                <div className="p-4 pt-0 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="space-y-4 py-2">
                        {day.meals.length > 0 ? (
                            day.meals.map((meal, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden flex-shrink-0">
                                            {meal.image_path ? (
                                                <img src={meal.image_path} alt={meal.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="flex items-center justify-center h-full text-lg">🍲</span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">{meal.name}</div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(meal.eaten_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="font-medium text-gray-600 dark:text-gray-300">
                                        {meal.calories} kcal
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-2">No meals logged.</p>
                        )}
                    </div>

                    {/* Macro Split Footer */}
                    <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-bold text-gray-700 dark:text-gray-200">Macro Split</span>
                        <div className="flex gap-4 text-gray-600 dark:text-gray-300">
                            <span>Protein: <span className="font-bold">{day.macros.protein}g</span></span>
                            <span>Carbs: <span className="font-bold">{day.macros.carbs}g</span></span>
                            <span>Fats: <span className="font-bold">{day.macros.fat}g</span></span>
                        </div>
                    </div>
                </div>
            </Transition>
        </div>
    );
}
