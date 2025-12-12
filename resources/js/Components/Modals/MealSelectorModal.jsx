import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Search, Check, Filter } from 'lucide-react';
import { RECOMMENDATIONS } from '@/Data/RecommendedMeals';

export default function MealSelectorModal({ isOpen, onClose, onSelect, currentDay }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', 'Vegetable', 'Protein', 'Breakfast'];

    const filteredMeals = RECOMMENDATIONS.filter(meal => {
        const matchesSearch = meal.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'All' || meal.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all border border-gray-100 dark:border-gray-700">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-bold leading-6 text-gray-900 dark:text-white flex justify-between items-center mb-4"
                                >
                                    <span>Select Meal for <span className="text-emerald-500">{currentDay}</span></span>
                                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </Dialog.Title>

                                {/* Search & Filter */}
                                <div className="space-y-4 mb-6">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search rich foods (e.g. spinach, fish)..."
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:text-white transition-all"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setActiveCategory(cat)}
                                                className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeCategory === cat
                                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* List */}
                                <div className="max-h-[50vh] overflow-y-auto custom-scrollbar pr-2 space-y-2">
                                    {filteredMeals.map((meal) => (
                                        <button
                                            key={meal.id}
                                            onClick={() => onSelect(meal)}
                                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent hover:border-emerald-100 dark:hover:border-emerald-800 transition-all group text-left"
                                        >
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                                                    {meal.name}
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-1.5">
                                                    <span className="text-xs text-gray-500">Rp {meal.price.toLocaleString('id-ID')}</span>
                                                    <span className="text-gray-300">•</span>
                                                    {meal.tags.map((tag, idx) => (
                                                        <span key={idx} className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${tag.includes('Animal') ? 'bg-emerald-100 text-emerald-700' :
                                                                tag.includes('MPASI') ? 'bg-blue-100 text-blue-700' :
                                                                    tag.includes('Iron') ? 'bg-orange-100 text-orange-700' :
                                                                        'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                                <Check className="w-4 h-4" />
                                            </div>
                                        </button>
                                    ))}

                                    {filteredMeals.length === 0 && (
                                        <div className="text-center py-8 text-gray-400">
                                            No meals found matching your criteria.
                                        </div>
                                    )}
                                </div>

                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
