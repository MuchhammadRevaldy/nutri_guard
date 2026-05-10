import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import { ChefHat, Plus, X, AlertTriangle, Clock, Flame, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

export default function FitChef({ auth, remainingCalories, calorieGoal, allergies }) {
    const [inputValue, setInputValue]     = useState('');
    const [ingredients, setIngredients]   = useState([]);
    const [recipes, setRecipes]           = useState([]);
    const [loading, setLoading]           = useState(false);
    const [error, setError]               = useState(null);
    const [expanded, setExpanded]         = useState(null);

    function addIngredient() {
        const val = inputValue.trim();
        if (val && !ingredients.includes(val)) setIngredients(p => [...p, val]);
        setInputValue('');
    }

    async function generate() {
        if (ingredients.length === 0) return;
        setLoading(true); setError(null); setRecipes([]);
        try {
            const res = await axios.post(route('fitchef.generate'), { ingredients });
            setRecipes(res.data.recipes ?? []);
        } catch {
            setError('Gagal membuat resep. Coba lagi.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthenticatedLayout user={auth.user} header="FitChef">
            <Head title="FitChef" />
            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">

                {/* Calorie budget + allergen info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Sisa Kalori Hari Ini</div>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-2xl font-extrabold ${remainingCalories < 300 ? 'text-red-500' : remainingCalories < 500 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                {remainingCalories.toLocaleString('id-ID')}
                            </span>
                            <span className="text-sm text-gray-500">kkal dari {calorieGoal.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="mt-2 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (remainingCalories / calorieGoal) * 100)}%` }} />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Resep yang dibuat tidak akan melebihi batas ini</p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Alergi yang Difilter</div>
                        {allergies?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {allergies.map((a, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs font-medium rounded-full border border-red-200 dark:border-red-800">
                                        🚫 {a}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Tidak ada alergi tercatat. Set di Pengaturan.</p>
                        )}
                    </div>
                </div>

                {/* Ingredient input */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Bahan yang Tersedia</h3>
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                            placeholder="Tambah bahan, tekan Enter..."
                            className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-400"
                        />
                        <button onClick={addIngredient} className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors">
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                    {ingredients.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {ingredients.map((ing, i) => (
                                <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium rounded-full">
                                    {ing}
                                    <button onClick={() => setIngredients(p => p.filter((_, j) => j !== i))} className="hover:text-red-500 transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                    <button
                        onClick={generate}
                        disabled={ingredients.length === 0 || loading}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50"
                    >
                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Membuat resep...</> : <><ChefHat className="w-4 h-4" /> Buat Resep</>}
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                )}

                {/* Recipes */}
                {recipes.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{recipes.length} Resep Ditemukan</h3>
                        {recipes.map((recipe, i) => (
                            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900 dark:text-white">{recipe.title}</h4>
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                                                    <Flame className="w-4 h-4" />{recipe.calories} kkal
                                                </div>
                                                {recipe.protein && (
                                                    <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                                        Protein: {recipe.protein}g
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                                    <Clock className="w-4 h-4" />{recipe.time}
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => setExpanded(expanded === i ? null : i)}
                                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                            {expanded === i ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    {recipe.calories > remainingCalories && (
                                        <div className="mt-3 flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                                            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                            <p className="text-xs text-amber-700 dark:text-amber-300">Kalori melebihi sisa kuota harian</p>
                                        </div>
                                    )}
                                </div>

                                {expanded === i && (
                                    <div className="border-t border-gray-100 dark:border-gray-800 p-5 space-y-4">
                                        <div>
                                            <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Bahan-bahan</h5>
                                            <ul className="space-y-1">
                                                {recipe.ingredients?.map((ing, j) => (
                                                    <li key={j} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />{ing}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Langkah Memasak</h5>
                                            <ol className="space-y-2">
                                                {recipe.steps?.map((step, j) => (
                                                    <li key={j} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                                                        <span className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{j + 1}</span>
                                                        {step}
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
