import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';

export default function FitChef({ auth }) {
    const [ingredients, setIngredients] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [recipes, setRecipes] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = inputValue.trim();
            if (val && !ingredients.includes(val)) {
                setIngredients([...ingredients, val]);
                setInputValue('');
            }
        }
    };

    const removeIngredient = (ing) => {
        setIngredients(ingredients.filter(i => i !== ing));
    };

    const handleGenerate = async () => {
        if (ingredients.length === 0) return;

        setLoading(true);
        try {
            const { data } = await axios.post('/fitchef/generate', { ingredients });
            if (data && data.recipes) {
                setRecipes(data.recipes);
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            alert('Gagal membuat resep.');
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">FitChef AI</h2>}>
            <Head title="FitChef AI" />

            <div className="py-12 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">

                    {/* Header Section */}
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            FitChef AI Recipe Maker
                        </h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                            Enter the ingredients you have and let AI craft healthy, delicious recipes for your family.
                        </p>
                    </div>

                    {/* Input Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl max-w-4xl mx-auto border border-gray-100 dark:border-gray-700">

                        <div className="relative mb-6">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-lg focus:ring-2 focus:ring-emerald-500 transition-all dark:text-white"
                                placeholder="Type an ingredient or dish (e.g., grilled chicken, broccoli)... press Enter to add"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>

                        {/* Chips */}
                        <div className="flex flex-wrap gap-3 mb-8 min-h-[40px]">
                            {ingredients.map((ing, idx) => (
                                <span key={idx} className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full font-bold text-sm animate-fade-in">
                                    {ing}
                                    <button onClick={() => removeIngredient(ing)} className="hover:text-emerald-900 dark:hover:text-emerald-100 focus:outline-none">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </span>
                            ))}
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={loading || ingredients.length === 0}
                            className={`w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full shadow-lg shadow-emerald-500/30 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    AI is thinking...
                                </>
                            ) : (
                                'Generate Recipes'
                            )}
                        </button>
                    </div>

                    {/* Results Section */}
                    {recipes && (
                        <div className="space-y-8 animate-fade-in-up">
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white text-center">Your Recipe Results</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                                {recipes.map((recipe, idx) => (
                                    <div key={idx} className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:border-emerald-500 transition-colors group">
                                        <div className="mb-4">
                                            <h4 className="text-xl font-extrabold text-gray-900 dark:text-white mb-3 group-hover:text-emerald-500 transition-colors">{recipe.title}</h4>
                                            <div className="flex gap-2 mb-4">
                                                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 text-xs font-bold rounded-full">
                                                    ~{recipe.calories} kcal
                                                </span>
                                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">
                                                    {recipe.time}
                                                </span>
                                            </div>

                                            <div className="mb-4">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Ingredients</p>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                    {recipe.ingredients.join(', ')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                                            <details className="group/details">
                                                <summary className="flex items-center justify-between cursor-pointer text-emerald-600 font-bold text-sm hover:text-emerald-700">
                                                    <span>View Cooking Steps</span>
                                                    <svg className="w-5 h-5 transition-transform group-open/details:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </summary>
                                                <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400 pl-2 border-l-2 border-emerald-100">
                                                    {recipe.steps.map((step, sIdx) => (
                                                        <p key={sIdx}>{sIdx + 1}. {step}</p>
                                                    ))}
                                                </div>
                                            </details>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
