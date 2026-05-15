import { useState, useCallback, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import {
    CalendarDays, Plus, Trash2, X, Coffee, Sun, Sunset, Moon,
    ChevronLeft, ChevronRight, Sparkles, RefreshCw, PlusCircle,
    Zap, AlertTriangle, CheckCircle, Loader2, Flame, Beef, Wheat, Droplets, StickyNote,
    ChefHat, Clock, Users, Star, ArrowLeft, Lightbulb, ListOrdered
} from 'lucide-react';
import FadeUp from '@/Components/FadeUp';

const MEAL_META = {
    breakfast: { label: 'Sarapan',     icon: Coffee,  color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20',    border: 'border-amber-200 dark:border-amber-800' },
    lunch:     { label: 'Makan Siang', icon: Sun,     color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800' },
    dinner:    { label: 'Makan Malam', icon: Sunset,  color: 'text-violet-500',  bg: 'bg-violet-50 dark:bg-violet-900/20',  border: 'border-violet-200 dark:border-violet-800' },
    snack:     { label: 'Snack',       icon: Moon,    color: 'text-orange-500',  bg: 'bg-orange-50 dark:bg-orange-900/20',  border: 'border-orange-200 dark:border-orange-800' },
};

// ── Add Meal Modal ────────────────────────────────────────────────────────────
function AddMealModal({ date, mealType, calorieGoal, onClose }) {
    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => { setIsOpen(true); }, []);
    const handleClose = () => { setIsOpen(false); setTimeout(onClose, 300); };

    const { data, setData, post, processing, errors } = useForm({
        planned_date: date,
        meal_type:    mealType,
        name:         '',
        calories:     '',
        protein:      '',
        carbs:        '',
        fat:          '',
        notes:        '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('meal-planner.store'), { onSuccess: handleClose });
    }

    return (
        <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'}`}>
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-white">Tambah {MEAL_META[mealType]?.label}</h3>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={submit} className="p-5 space-y-4">
                    <div>
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Nama Makanan *</label>
                        <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { key: 'calories', label: 'Kalori (kkal)' },
                            { key: 'protein',  label: 'Protein (g)' },
                            { key: 'carbs',    label: 'Karbo (g)' },
                            { key: 'fat',      label: 'Lemak (g)' },
                        ].map(f => (
                            <div key={f.key}>
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">{f.label}</label>
                                <input type="number" min="0" value={data[f.key]} onChange={e => setData(f.key, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                            </div>
                        ))}
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Catatan</label>
                        <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={2}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={handleClose} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium">Batal</button>
                        <button type="submit" disabled={processing} className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl text-sm disabled:opacity-60">
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Meal Detail Modal ────────────────────────────────────────────────────────
function MealDetailModal({ meal, onClose, onDelete }) {
    const [isOpen, setIsOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    useEffect(() => { setIsOpen(true); }, []);
    const handleClose = () => { setIsOpen(false); setTimeout(onClose, 300); };

    const meta    = MEAL_META[meal.meal_type];
    const Icon    = meta?.icon ?? Coffee;
    const canCook = ['breakfast','lunch','dinner'].includes(meal.meal_type);

    const [view, setView]       = useState('detail');   // 'detail' | 'recipe'
    const [recipe, setRecipe]   = useState(null);
    const [recLoading, setRL]   = useState(false);
    const [recError, setRE]     = useState(null);

    const fetchRecipe = useCallback(async () => {
        if (recipe) { setView('recipe'); return; }   // already fetched
        setRL(true); setRE(null); setView('recipe');
        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
            const res  = await fetch('/nutribot/recipe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
                body: JSON.stringify({
                    meal_name: meal.name,
                    calories:  meal.calories,
                    meal_type: meal.meal_type,
                }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setRecipe(data.recipe);
        } catch (e) {
            setRE(e.message ?? 'Gagal memuat resep.');
        } finally {
            setRL(false);
        }
    }, [meal, recipe]);

    const diffColor = { 'Mudah': 'text-emerald-500', 'Sedang': 'text-amber-500', 'Sulit': 'text-red-500' };

    return (
        <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            {/* Modal — wider when recipe visible */}
            <div className={`bg-white dark:bg-gray-900 rounded-3xl w-full shadow-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'} ${
                view === 'recipe' ? 'max-w-md' : 'max-w-sm'
            }`}>

                {/* ── HEADER (always visible) ── */}
                <div className={`p-5 ${meta?.bg} border-b ${meta?.border} flex-shrink-0`}>
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                            {view === 'recipe' ? (
                                <button onClick={() => setView('detail')}
                                    className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                                    <ArrowLeft className="w-3.5 h-3.5" /> Kembali
                                </button>
                            ) : (
                                <><Icon className={`w-5 h-5 ${meta?.color}`} />
                                <span className={`text-xs font-semibold uppercase tracking-wide ${meta?.color}`}>{meta?.label}</span></>
                            )}
                        </div>
                        <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <h3 className="mt-2 text-lg font-bold text-gray-900 dark:text-white leading-snug">{meal.name}</h3>
                    {view === 'detail' && meal.notes && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 italic">{meal.notes}</p>
                    )}
                    {view === 'recipe' && recipe && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="flex items-center gap-1 text-xs bg-white/60 dark:bg-black/20 rounded-full px-2.5 py-1">
                                <Clock className="w-3 h-3 text-gray-500" />
                                <span className="text-gray-600 dark:text-gray-300">Prep {recipe.prep_time}</span>
                            </span>
                            <span className="flex items-center gap-1 text-xs bg-white/60 dark:bg-black/20 rounded-full px-2.5 py-1">
                                <ChefHat className="w-3 h-3 text-gray-500" />
                                <span className="text-gray-600 dark:text-gray-300">Masak {recipe.cook_time}</span>
                            </span>
                            <span className="flex items-center gap-1 text-xs bg-white/60 dark:bg-black/20 rounded-full px-2.5 py-1">
                                <Users className="w-3 h-3 text-gray-500" />
                                <span className="text-gray-600 dark:text-gray-300">{recipe.servings}</span>
                            </span>
                            {recipe.difficulty && (
                                <span className={`flex items-center gap-1 text-xs bg-white/60 dark:bg-black/20 rounded-full px-2.5 py-1 font-semibold ${diffColor[recipe.difficulty] ?? 'text-gray-500'}`}>
                                    <Star className="w-3 h-3" /> {recipe.difficulty}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* ── DETAIL PANEL ── */}
                {view === 'detail' && (
                    showDeleteConfirm ? (
                        <div className="p-6 text-center animate-[pulse_0.2s_ease-out_1]">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Hapus dari Meal Plan?</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Apakah Anda yakin ingin menghapus <b>{meal.name}</b>? Tindakan ini tidak dapat dibatalkan.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Batal</button>
                                <button onClick={() => { onDelete(meal.id); handleClose(); }} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30">Ya, Hapus</button>
                            </div>
                        </div>
                    ) : (
                    <div className="p-5">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Informasi Gizi</p>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: Flame,    label: 'Kalori',  value: meal.calories, unit: 'kkal', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                                { icon: Beef,     label: 'Protein', value: meal.protein,  unit: 'g',    color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20' },
                                { icon: Wheat,    label: 'Karbo',   value: meal.carbs,    unit: 'g',    color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-900/20' },
                                { icon: Droplets, label: 'Lemak',   value: meal.fat,      unit: 'g',    color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
                            ].map(n => (
                                <div key={n.label} className={`${n.bg} rounded-2xl p-3 flex items-center gap-2.5`}>
                                    <n.icon className={`w-5 h-5 ${n.color} flex-shrink-0`} />
                                    <div>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{n.label}</p>
                                        <p className={`text-base font-bold ${n.color}`}>
                                            {n.value != null ? n.value : '—'}<span className="text-xs font-normal ml-0.5">{n.unit}</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recipe button — only for breakfast/lunch/dinner */}
                        {canCook && (
                            <button onClick={fetchRecipe}
                                className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold
                                           bg-gradient-to-r from-violet-600 to-purple-700 text-white
                                           flex items-center justify-center gap-2
                                           shadow-md shadow-violet-500/30 hover:shadow-violet-500/50
                                           hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                                <ChefHat className="w-4 h-4" />
                                Lihat Cara Membuat
                            </button>
                        )}

                        <div className="flex gap-2 mt-3">
                            <button onClick={handleClose}
                                className="flex-1 py-2.5 text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                Tutup
                            </button>
                            <button onClick={() => setShowDeleteConfirm(true)}
                                className="flex-1 py-2.5 text-sm font-semibold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center gap-1.5">
                                <Trash2 className="w-3.5 h-3.5" /> Hapus
                            </button>
                        </div>
                    </div>
                    )
                )}

                {/* ── RECIPE PANEL ── */}
                {view === 'recipe' && (
                    <div className="p-5 max-h-[60vh] overflow-y-auto space-y-5">

                        {/* Loading */}
                        {recLoading && (
                            <div className="flex flex-col items-center justify-center py-10 gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                    <ChefHat className="w-6 h-6 text-violet-600 dark:text-violet-400 animate-bounce" />
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Chef AI sedang menyiapkan resep...</p>
                            </div>
                        )}

                        {/* Error */}
                        {recError && !recLoading && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
                                <p className="text-sm text-red-600 dark:text-red-400 mb-3">{recError}</p>
                                <button onClick={fetchRecipe}
                                    className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline">
                                    Coba lagi
                                </button>
                            </div>
                        )}

                        {/* Recipe content */}
                        {recipe && !recLoading && (
                            <>
                                {/* Ingredients */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                            <ListOrdered className="w-3.5 h-3.5 text-emerald-600" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Bahan-Bahan</p>
                                    </div>
                                    <ul className="space-y-2">
                                        {recipe.ingredients?.map((ing, i) => (
                                            <li key={i} className="flex items-start gap-2.5">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">{ing}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="border-t border-gray-100 dark:border-gray-800" />

                                {/* Steps */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                            <ChefHat className="w-3.5 h-3.5 text-violet-600" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Langkah Memasak</p>
                                    </div>
                                    <ol className="space-y-3">
                                        {recipe.steps?.map((step, i) => (
                                            <li key={i} className="flex gap-3">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                                                    {i + 1}
                                                </span>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{step}</p>
                                            </li>
                                        ))}
                                    </ol>
                                </div>

                                {/* Tips */}
                                {recipe.tips && (
                                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex gap-2.5">
                                        <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed"><strong>Tips:</strong> {recipe.tips}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── AI Generate Overlay ───────────────────────────────────────────────────────
function AIGenerateOverlay({ weekStart, familyMember, calorieGoal, hasExistingPlans, onClose }) {
    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => { setIsOpen(true); }, []);
    const handleClose = () => { setIsOpen(false); setTimeout(onClose, 300); };

    const [mode, setMode] = useState(null);       // 'replace' | 'fill'
    const [loading, setLoading] = useState(false);
    const [error, setError]   = useState(null);

    const healthGoalLabel = {
        loss:        '🔥 Turun Berat Badan',
        gain:        '💪 Naik Berat Badan',
        maintenance: '⚖️ Jaga Berat Badan',
        growth:      '🌱 Tumbuh Optimal',
    }[familyMember?.health_goal] ?? '⚖️ Jaga Kesehatan';

    const allergies = familyMember?.allergies ?? [];

    function handleGenerate() {
        if (!mode) return;
        setLoading(true);
        setError(null);

        router.post(
            route('meal-planner.generate'),
            { week_start: weekStart, mode },
            {
                onSuccess: () => { setLoading(false); handleClose(); },
                onError:   (e) => { setLoading(false); setError(e.error ?? 'Terjadi kesalahan.'); },
            }
        );
    }

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'}`}>

                {/* Header */}
                <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 text-white">
                    <div className="absolute inset-0 opacity-20"
                         style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    <button onClick={handleClose} className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Generate AI Meal Plan</h2>
                            <p className="text-sm text-white/70">Rencana makan sehat 1 minggu oleh AI</p>
                        </div>
                    </div>

                    {/* User profile summary */}
                    <div className="mt-4 bg-white/10 rounded-2xl p-3 flex flex-wrap gap-2 text-xs">
                        <span className="bg-white/15 rounded-full px-2.5 py-1">🎯 {calorieGoal} kkal/hari</span>
                        <span className="bg-white/15 rounded-full px-2.5 py-1">{healthGoalLabel}</span>
                        {allergies.length > 0
                            ? <span className="bg-red-400/30 rounded-full px-2.5 py-1">⚠️ Pantang: {allergies.join(', ')}</span>
                            : <span className="bg-white/15 rounded-full px-2.5 py-1">✅ Tidak ada alergi</span>
                        }
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">

                    {/* Warning if existing plans */}
                    {hasExistingPlans && (
                        <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700 dark:text-amber-400">
                                Minggu ini sudah ada meal plan. Pilih apakah ingin diganti atau hanya melengkapi yang kosong.
                            </p>
                        </div>
                    )}

                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Pilih mode generate:
                    </p>

                    {/* Mode cards */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {/* Replace card */}
                        <button
                            id="mode-replace"
                            onClick={() => setMode('replace')}
                            className={`relative text-left rounded-2xl border-2 p-4 transition-all duration-200 ${
                                mode === 'replace'
                                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 shadow-md shadow-violet-500/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-700 bg-white dark:bg-gray-800'
                            }`}
                        >
                            {mode === 'replace' && (
                                <CheckCircle className="absolute top-3 right-3 w-4 h-4 text-violet-500" />
                            )}
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-3">
                                <RefreshCw className="w-4 h-4 text-white" />
                            </div>
                            <p className="font-semibold text-sm text-gray-900 dark:text-white">Ganti Semua</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Hapus meal plan minggu ini dan isi ulang seluruhnya dengan rekomendasi AI
                            </p>
                        </button>

                        {/* Fill card */}
                        <button
                            id="mode-fill"
                            onClick={() => setMode('fill')}
                            className={`relative text-left rounded-2xl border-2 p-4 transition-all duration-200 ${
                                mode === 'fill'
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 shadow-md shadow-emerald-500/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 bg-white dark:bg-gray-800'
                            }`}
                        >
                            {mode === 'fill' && (
                                <CheckCircle className="absolute top-3 right-3 w-4 h-4 text-emerald-500" />
                            )}
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-3">
                                <PlusCircle className="w-4 h-4 text-white" />
                            </div>
                            <p className="font-semibold text-sm text-gray-900 dark:text-white">Tambah yang Kosong</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Pertahankan meal plan yang sudah ada, hanya isi slot hari/waktu yang masih kosong
                            </p>
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-xs text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                        <button onClick={handleClose} disabled={loading}
                            className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
                            Batal
                        </button>
                        <button
                            id="btn-generate-confirm"
                            onClick={handleGenerate}
                            disabled={!mode || loading}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                                mode === 'replace'
                                    ? 'bg-gradient-to-r from-violet-600 to-purple-700 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50'
                                    : mode === 'fill'
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50'
                                    : 'bg-gray-300 dark:bg-gray-700'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>AI sedang memasak...</span>
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4" />
                                    <span>Generate Sekarang</span>
                                </>
                            )}
                        </button>
                    </div>

                    {!loading && (
                        <p className="text-center text-xs text-gray-400">
                            ⏱ Biasanya membutuhkan 5–15 detik
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MealPlanner({ auth, days, weekStart, weekEnd, calorieGoal, familyMember }) {
    const [modal, setModal]         = useState(null);   // { date, mealType }
    const [showDay, setShowDay]     = useState(null);
    const [showAI, setShowAI]       = useState(false);
    const [selectedMeal, setMeal]   = useState(null);  // meal object for detail
    const [confirmDeleteId, setConfirmDeleteId] = useState(null); // ID for delete confirmation

    function navigate(dir) {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + dir * 7);
        router.get(route('meal-planner'), { week_start: d.toISOString().slice(0, 10) }, { preserveState: true });
    }

    function requestDeletePlan(id) {
        setConfirmDeleteId(id);
    }

    function executeDelete() {
        if (!confirmDeleteId) return;
        router.delete(route('meal-planner.destroy', confirmDeleteId), { 
            preserveState: true,
            onSuccess: () => setConfirmDeleteId(null)
        });
    }

    const totalCalsPerDay = (day) => day.meals.reduce((s, m) => s + (m.calories || 0), 0);
    const hasExistingPlans = days.some(d => d.meals.length > 0);

    return (
        <AuthenticatedLayout user={auth.user} header="Meal Planner">
            <Head title="Meal Planner" />

            {/* Add Meal Modal */}
            {modal && (
                <AddMealModal
                    date={modal.date}
                    mealType={modal.mealType}
                    calorieGoal={calorieGoal}
                    onClose={() => setModal(null)}
                />
            )}

            {/* Meal Detail Modal */}
            {selectedMeal && (
                <MealDetailModal
                    meal={selectedMeal}
                    onClose={() => setMeal(null)}
                    onDelete={(id) => { requestDeletePlan(id); setMeal(null); }}
                />
            )}

            {/* AI Generate Overlay */}
            {showAI && (
                <AIGenerateOverlay
                    weekStart={weekStart}
                    familyMember={familyMember}
                    calorieGoal={calorieGoal}
                    hasExistingPlans={hasExistingPlans}
                    onClose={() => setShowAI(false)}
                />
            )}

            <div className="p-4 sm:p-6 lg:p-8 space-y-6">

                {/* Week navigator + AI button */}
                <FadeUp delay={0}>
                <div className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0">
                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>

                    <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 justify-center">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-emerald-500" />
                            <span className="font-semibold text-gray-900 dark:text-white text-sm">
                                {new Date(weekStart).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} –{' '}
                                {new Date(weekEnd).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>

                        {/* AI Generate button */}
                        <button
                            id="btn-ai-generate"
                            onClick={() => setShowAI(true)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white
                                       bg-gradient-to-r from-violet-600 to-purple-700
                                       shadow-md shadow-violet-500/30
                                       hover:shadow-violet-500/50 hover:scale-105
                                       active:scale-95 transition-all duration-200"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            Generate AI Plan
                        </button>
                    </div>

                    <button onClick={() => navigate(1)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0">
                        <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                </FadeUp>

                {/* Mobile: day selector */}
                <FadeUp delay={50}>
                <div className="flex gap-2 overflow-x-auto pb-1 sm:hidden">
                    {days.map((day, i) => {
                        const isToday = day.date === new Date().toISOString().slice(0, 10);
                        const active  = showDay === null ? isToday : showDay === i;
                        return (
                            <button key={i} onClick={() => setShowDay(i)}
                                className={`flex flex-col items-center px-3 py-2 rounded-xl flex-shrink-0 transition-all ${active ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}>
                                <span className="text-[10px] font-medium">{day.label}</span>
                                <span className="text-sm font-bold">{new Date(day.date).getDate()}</span>
                            </button>
                        );
                    })}
                </div>
                </FadeUp>

                {/* Desktop: full week grid */}
                <div className="hidden sm:grid grid-cols-7 gap-3">
                    {days.map((day, i) => {
                        const isToday   = day.date === new Date().toISOString().slice(0, 10);
                        const dayTotal  = totalCalsPerDay(day);
                        const overBudget = dayTotal > calorieGoal;
                        return (
                            <FadeUp key={i} delay={80 + i * 60} y={20}>
                            <div
                                className={`bg-white dark:bg-gray-900 rounded-2xl border overflow-hidden ${isToday ? 'border-emerald-400 dark:border-emerald-600 shadow-lg shadow-emerald-500/10' : 'border-gray-100 dark:border-gray-800'}`}
                            >
                                <div className={`p-2 text-center ${isToday ? 'bg-emerald-500' : 'bg-gray-50 dark:bg-gray-800'}`}>
                                    <div className={`text-[10px] font-medium ${isToday ? 'text-emerald-100' : 'text-gray-500 dark:text-gray-400'}`}>{day.label}</div>
                                    <div className={`text-base font-extrabold ${isToday ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{new Date(day.date).getDate()}</div>
                                    {dayTotal > 0 && (
                                        <div className={`text-[10px] font-medium mt-0.5 ${overBudget ? 'text-red-300' : isToday ? 'text-emerald-100' : 'text-gray-400'}`}>
                                            {dayTotal} kkal
                                        </div>
                                    )}
                                </div>
                                <div className="p-2 space-y-1.5">
                                    {Object.entries(MEAL_META).map(([key, meta], mi) => {
                                        const Icon     = meta.icon;
                                        const dayMeals = day.meals.filter(m => m.meal_type === key);
                                        return (
                                            <FadeUp key={key} delay={160 + i * 60 + mi * 40} y={10}>
                                            <div
                                                className={`rounded-lg p-1.5 ${meta.bg}`}
                                            >
                                                <div className={`flex items-center gap-1 mb-1 ${meta.color}`}>
                                                    <Icon className="w-3 h-3" />
                                                    <span className="text-[10px] font-semibold">{meta.label}</span>
                                                </div>
                                                {dayMeals.map(m => (
                                                    <div key={m.id} className="flex items-center justify-between gap-1 mb-0.5 group">
                                                        <button onClick={() => setMeal(m)}
                                                            className="text-[10px] text-gray-700 dark:text-gray-300 truncate text-left hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex-1">
                                                            {m.name}
                                                        </button>
                                                        <button onClick={() => requestDeletePlan(m.id)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100">
                                                            <X className="w-2.5 h-2.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button onClick={() => setModal({ date: day.date, mealType: key })}
                                                    className={`w-full flex items-center justify-center gap-0.5 py-0.5 rounded text-[10px] font-medium ${meta.color} hover:bg-white/50 dark:hover:bg-black/20 transition-colors`}>
                                                    <Plus className="w-2.5 h-2.5" /> Tambah
                                                </button>
                                            </div>
                                            </FadeUp>
                                        );
                                    })}
                                </div>
                            </div>
                            </FadeUp>
                        );
                    })}
                </div>

                {/* Mobile: selected day detail */}
                <div className="sm:hidden">
                    {(() => {
                        const idx = showDay ?? days.findIndex(d => d.date === new Date().toISOString().slice(0, 10));
                        const day = days[idx < 0 ? 0 : idx];
                        if (!day) return null;
                        return (
                            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                                <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{day.full_label}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {totalCalsPerDay(day)} kkal dari {calorieGoal} kkal target
                                    </p>
                                </div>
                                <div className="p-4 space-y-3">
                                    {Object.entries(MEAL_META).map(([key, meta]) => {
                                        const Icon     = meta.icon;
                                        const dayMeals = day.meals.filter(m => m.meal_type === key);
                                        return (
                                            <div key={key} className={`rounded-xl border p-3 ${meta.bg} ${meta.border}`}>
                                                <div className={`flex items-center gap-2 mb-2 ${meta.color}`}>
                                                    <Icon className="w-4 h-4" />
                                                    <span className="text-sm font-semibold">{meta.label}</span>
                                                </div>
                                                {dayMeals.map(m => (
                                                    <div key={m.id} className="flex items-center justify-between gap-2 mb-1.5">
                                                        <button onClick={() => setMeal(m)} className="flex-1 text-left">
                                                            <span className="text-sm text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{m.name}</span>
                                                            {m.calories && <span className="text-xs text-gray-500 ml-2">{m.calories} kkal</span>}
                                                        </button>
                                                        <button onClick={() => requestDeletePlan(m.id)} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button onClick={() => setModal({ date: day.date, mealType: key })}
                                                    className={`w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold ${meta.color} hover:bg-white/60 dark:hover:bg-black/20 transition-colors`}>
                                                    <Plus className="w-3 h-3" /> Tambah
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Confirm Delete Modal */}
            <Modal show={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} maxWidth="sm">
                <div className="p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="w-7 h-7 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Hapus Rencana Ini?</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Tindakan ini tidak dapat dibatalkan. Menu ini akan dihapus dari jadwal meal plan Anda.</p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={executeDelete}
                            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg shadow-red-500/30"
                        >
                            Hapus
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
