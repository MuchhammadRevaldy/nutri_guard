import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import FadeUp from '@/Components/FadeUp';
import {
    ChefHat, Plus, X, AlertTriangle, Clock, Flame,
    Loader2, ChevronDown, ChevronUp, Download,
    Users, Beef, Wheat, Droplets, Lightbulb,
} from 'lucide-react';

// ── Download PDF ──────────────────────────────────────────────────────────────
function downloadRecipePDF(recipe) {
    const doc   = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 14;
    const contentW = pageW - margin * 2;

    // Header bar
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(0, 0, pageW, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(recipe.title, margin, 12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const prepTotal = (recipe.preparation_time ?? 0) + (recipe.cooking_time ?? 0);
    const meta = [
        `${recipe.calories ?? '-'} kkal`,
        `${recipe.servings ?? 1} porsi`,
        `${prepTotal} menit`,
        recipe.protein ? `Protein ${recipe.protein}g` : '',
    ].filter(Boolean).join('   •   ');
    doc.text(meta, margin, 22);

    // Nutrition table
    doc.setTextColor(0, 0, 0);
    let y = 36;
    doc.autoTable({
        startY: y,
        head:   [['Kalori', 'Protein', 'Karbohidrat', 'Lemak', 'Persiapan', 'Memasak', 'Porsi']],
        body:   [[
            `${recipe.calories ?? '-'} kkal`,
            `${recipe.protein  ?? '-'} g`,
            `${recipe.carbs    ?? '-'} g`,
            `${recipe.fat      ?? '-'} g`,
            `${recipe.preparation_time ?? '-'} mnt`,
            `${recipe.cooking_time     ?? '-'} mnt`,
            `${recipe.servings ?? 1} orang`,
        ]],
        styles:     { fontSize: 8.5, halign: 'center', cellPadding: 3 },
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
        margin:     { left: margin, right: margin },
    });

    y = doc.lastAutoTable.finalY + 8;

    // Ingredients
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text('BAHAN-BAHAN', margin, y);
    y += 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);

    const ings = recipe.ingredients ?? [];
    // 2-column layout for ingredients
    const half    = Math.ceil(ings.length / 2);
    const colW    = contentW / 2 - 3;

    ings.forEach((ing, idx) => {
        const col  = idx < half ? 0 : 1;
        const row  = idx < half ? idx : idx - half;
        const x    = margin + col * (colW + 6);
        const yPos = y + row * 5;

        // Auto-add page if needed
        if (yPos > 270) {
            doc.addPage();
            y = 15 - row * 5;
        }
        doc.setTextColor(16, 185, 129);
        doc.text('•', x, y + row * 5);
        doc.setTextColor(50, 50, 50);
        const lines = doc.splitTextToSize(ing, colW - 4);
        doc.text(lines[0], x + 4, y + row * 5);
    });

    y += (half * 5) + 8;
    if (y > 265) { doc.addPage(); y = 15; }

    // Steps
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text('LANGKAH MEMASAK', margin, y);
    y += 6;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);

    (recipe.steps ?? []).forEach((step, idx) => {
        if (y > 270) { doc.addPage(); y = 15; }

        // Step number circle
        doc.setFillColor(16, 185, 129);
        doc.circle(margin + 2.5, y - 1.5, 2.5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.text(String(idx + 1), margin + (idx + 1 < 10 ? 1.5 : 0.8), y - 0.2);

        doc.setTextColor(50, 50, 50);
        doc.setFontSize(8.5);
        const lines = doc.splitTextToSize(step, contentW - 9);
        doc.text(lines, margin + 7, y);
        y += lines.length * 4.5 + 2;
    });

    // Tips
    if (recipe.tips) {
        if (y > 260) { doc.addPage(); y = 15; }
        y += 4;
        doc.setFillColor(254, 252, 232); // amber-50
        doc.roundedRect(margin, y, contentW, 14, 2, 2, 'F');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(180, 120, 0);
        doc.text('💡 Tips Koki:', margin + 3, y + 5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 70, 0);
        const tipLines = doc.splitTextToSize(recipe.tips, contentW - 6);
        doc.text(tipLines, margin + 3, y + 10);
        y += 14 + tipLines.length * 4;
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(180, 180, 180);
        doc.text(
            `NutriGuard FitChef  •  Halaman ${i} dari ${pageCount}`,
            pageW / 2, 290, { align: 'center' }
        );
    }

    const filename = recipe.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase();
    doc.save(`resep-${filename}.pdf`);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function FitChef({ auth, remainingCalories, calorieGoal, allergies }) {
    const [inputValue,  setInputValue]  = useState('');
    const [ingredients, setIngredients] = useState([]);
    const [recipes,     setRecipes]     = useState([]);
    const [loading,     setLoading]     = useState(false);
    const [error,       setError]       = useState(null);
    const [expanded,    setExpanded]    = useState(null);

    function addIngredient() {
        const val = inputValue.trim();
        if (val && !ingredients.includes(val)) setIngredients(p => [...p, val]);
        setInputValue('');
    }

    async function generate() {
        if (ingredients.length === 0) return;
        setLoading(true); setError(null); setRecipes([]); setExpanded(null);
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
                <FadeUp delay={0}>
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
                                    <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs font-medium rounded-full border border-red-200 dark:border-red-800">
                                        🚫 {a}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Tidak ada alergi tercatat. Set di Pengaturan.</p>
                        )}
                    </div>
                </div>
                </FadeUp>

                {/* Ingredient input */}
                <FadeUp delay={100}>
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
                        className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500/50 backdrop-blur-md border border-orange-400/50 hover:bg-orange-400/60 text-white font-bold rounded-xl text-sm shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50"
                    >
                        {loading
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Membuat resep...</>
                            : <><ChefHat className="w-4 h-4" /> Buat Resep</>}
                    </button>
                </div>
                </FadeUp>

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
                        <FadeUp delay={0}><h3 className="text-sm font-semibold text-gray-900 dark:text-white">{recipes.length} Resep Ditemukan</h3></FadeUp>

                        {recipes.map((recipe, i) => (
                            <FadeUp key={i} delay={i * 80}>
                            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">

                                {/* ── Recipe header ── */}
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900 dark:text-white text-base">{recipe.title}</h4>

                                            {/* Macro pills */}
                                            <div className="flex flex-wrap items-center gap-2 mt-2.5">
                                                <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full">
                                                    <Flame className="w-3 h-3" />{recipe.calories} kkal
                                                </span>
                                                {recipe.protein != null && (
                                                    <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">
                                                        <Beef className="w-3 h-3" />P {recipe.protein}g
                                                    </span>
                                                )}
                                                {recipe.carbs != null && (
                                                    <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-full">
                                                        <Wheat className="w-3 h-3" />K {recipe.carbs}g
                                                    </span>
                                                )}
                                                {recipe.fat != null && (
                                                    <span className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-full">
                                                        <Droplets className="w-3 h-3" />L {recipe.fat}g
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full">
                                                    <Clock className="w-3 h-3" />
                                                    {(recipe.preparation_time ?? 0) + (recipe.cooking_time ?? 0)} menit
                                                </span>
                                                {recipe.servings && (
                                                    <span className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full">
                                                        <Users className="w-3 h-3" />{recipe.servings} porsi
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button
                                                onClick={() => downloadRecipePDF(recipe)}
                                                title="Download PDF"
                                                className="p-2 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setExpanded(expanded === i ? null : i)}
                                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
                                            >
                                                {expanded === i ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {recipe.calories > remainingCalories && (
                                        <div className="mt-3 flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                                            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                            <p className="text-xs text-amber-700 dark:text-amber-300">Kalori melebihi sisa kuota harian</p>
                                        </div>
                                    )}
                                </div>

                                {/* ── Expanded detail ── */}
                                {expanded === i && (
                                    <div className="border-t border-gray-100 dark:border-gray-800">

                                        {/* Time breakdown */}
                                        {(recipe.preparation_time || recipe.cooking_time) && (
                                            <div className="flex gap-4 px-5 pt-4">
                                                {recipe.preparation_time > 0 && (
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                        <span className="font-medium text-gray-700 dark:text-gray-300">Persiapan:</span>
                                                        {recipe.preparation_time} menit
                                                    </div>
                                                )}
                                                {recipe.cooking_time > 0 && (
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                        <span className="font-medium text-gray-700 dark:text-gray-300">Memasak:</span>
                                                        {recipe.cooking_time} menit
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="p-5 space-y-5">
                                            {/* Ingredients */}
                                            <div>
                                                <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                                                    Bahan-bahan
                                                    {recipe.servings && <span className="ml-1.5 normal-case text-gray-400">({recipe.servings} porsi)</span>}
                                                </h5>
                                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                                                    {recipe.ingredients?.map((ing, j) => (
                                                        <li key={j} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0 mt-1.5" />
                                                            {ing}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Steps */}
                                            <div>
                                                <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Langkah Memasak</h5>
                                                <ol className="space-y-3">
                                                    {recipe.steps?.map((step, j) => (
                                                        <li key={j} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                                                            <span className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                                {j + 1}
                                                            </span>
                                                            <span className="pt-0.5 leading-relaxed">{step}</span>
                                                        </li>
                                                    ))}
                                                </ol>
                                            </div>

                                            {/* Tips */}
                                            {recipe.tips && (
                                                <div className="flex items-start gap-3 p-3.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                                                    <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-0.5">Tips Koki</p>
                                                        <p className="text-sm text-amber-800 dark:text-amber-300">{recipe.tips}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Download button (bottom) */}
                                            <button
                                                onClick={() => downloadRecipePDF(recipe)}
                                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500/20 dark:bg-emerald-500/15 backdrop-blur-sm border border-emerald-400/50 dark:border-emerald-400/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/30 dark:hover:bg-emerald-400/25 rounded-xl text-sm font-semibold shadow-sm transition-all"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download Resep PDF
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            </FadeUp>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
