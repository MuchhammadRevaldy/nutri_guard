import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { CalendarDays, Plus, Trash2, X, Coffee, Sun, Sunset, Moon, ChevronLeft, ChevronRight } from 'lucide-react';

const MEAL_META = {
    breakfast: { label: 'Sarapan',     icon: Coffee,  color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20',   border: 'border-amber-200 dark:border-amber-800' },
    lunch:     { label: 'Makan Siang', icon: Sun,     color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800' },
    dinner:    { label: 'Makan Malam', icon: Sunset,  color: 'text-violet-500',  bg: 'bg-violet-50 dark:bg-violet-900/20',  border: 'border-violet-200 dark:border-violet-800' },
    snack:     { label: 'Snack',       icon: Moon,    color: 'text-orange-500',  bg: 'bg-orange-50 dark:bg-orange-900/20',  border: 'border-orange-200 dark:border-orange-800' },
};

function AddMealModal({ date, mealType, calorieGoal, onClose }) {
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
        post(route('meal-planner.store'), { onSuccess: onClose });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-white">Tambah {MEAL_META[mealType]?.label}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
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
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium">Batal</button>
                        <button type="submit" disabled={processing} className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl text-sm disabled:opacity-60">
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function MealPlanner({ auth, days, weekStart, weekEnd, calorieGoal }) {
    const [modal, setModal]   = useState(null); // { date, mealType }
    const [showDay, setShowDay] = useState(null);

    function navigate(dir) {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + dir * 7);
        router.get(route('meal-planner'), { week_start: d.toISOString().slice(0, 10) }, { preserveState: true });
    }

    function deletePlan(id) {
        if (!confirm('Hapus rencana ini?')) return;
        router.delete(route('meal-planner.destroy', id), { preserveState: true });
    }

    const totalCalsPerDay = (day) => day.meals.reduce((s, m) => s + (m.calories || 0), 0);

    return (
        <AuthenticatedLayout user={auth.user} header="Meal Planner">
            <Head title="Meal Planner" />

            {modal && (
                <AddMealModal
                    date={modal.date}
                    mealType={modal.mealType}
                    calorieGoal={calorieGoal}
                    onClose={() => setModal(null)}
                />
            )}

            <div className="p-4 sm:p-6 lg:p-8 space-y-6">

                {/* Week navigator */}
                <div className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <div className="text-center">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-emerald-500" />
                            <span className="font-semibold text-gray-900 dark:text-white text-sm">
                                {new Date(weekStart).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} –{' '}
                                {new Date(weekEnd).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                    <button onClick={() => navigate(1)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Mobile: day selector */}
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

                {/* Desktop: full week grid */}
                <div className="hidden sm:grid grid-cols-7 gap-3">
                    {days.map((day, i) => {
                        const isToday  = day.date === new Date().toISOString().slice(0, 10);
                        const dayTotal = totalCalsPerDay(day);
                        const overBudget = dayTotal > calorieGoal;
                        return (
                            <div key={i} className={`bg-white dark:bg-gray-900 rounded-2xl border overflow-hidden ${isToday ? 'border-emerald-400 dark:border-emerald-600 shadow-lg shadow-emerald-500/10' : 'border-gray-100 dark:border-gray-800'}`}>
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
                                    {Object.entries(MEAL_META).map(([key, meta]) => {
                                        const Icon    = meta.icon;
                                        const dayMeals = day.meals.filter(m => m.meal_type === key);
                                        return (
                                            <div key={key} className={`rounded-lg p-1.5 ${meta.bg}`}>
                                                <div className={`flex items-center gap-1 mb-1 ${meta.color}`}>
                                                    <Icon className="w-3 h-3" />
                                                    <span className="text-[10px] font-semibold">{meta.label}</span>
                                                </div>
                                                {dayMeals.map(m => (
                                                    <div key={m.id} className="flex items-center justify-between gap-1 mb-0.5">
                                                        <span className="text-[10px] text-gray-700 dark:text-gray-300 truncate">{m.name}</span>
                                                        <button onClick={() => deletePlan(m.id)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                                                            <X className="w-2.5 h-2.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button onClick={() => setModal({ date: day.date, mealType: key })}
                                                    className={`w-full flex items-center justify-center gap-0.5 py-0.5 rounded text-[10px] font-medium ${meta.color} hover:bg-white/50 dark:hover:bg-black/20 transition-colors`}>
                                                    <Plus className="w-2.5 h-2.5" /> Tambah
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
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
                                                        <div>
                                                            <span className="text-sm text-gray-700 dark:text-gray-300">{m.name}</span>
                                                            {m.calories && <span className="text-xs text-gray-500 ml-2">{m.calories} kkal</span>}
                                                        </div>
                                                        <button onClick={() => deletePlan(m.id)} className="text-gray-400 hover:text-red-500 transition-colors">
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
        </AuthenticatedLayout>
    );
}
