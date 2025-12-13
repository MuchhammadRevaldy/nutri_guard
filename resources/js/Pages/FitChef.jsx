import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Groq } from 'groq-sdk';
import { jsPDF } from "jspdf";

const MODEL_NAME = "llama-3.1-8b-instant";
const MAX_TOKENS = 6000;

const systemPrompt = `
    Kamu adalah Chef AI Profesional dan Ahli Gizi (FitChef).
    
    TUGAS UTAMA:
    Buatlah resep masakan yang LENGKAP, DETAIL, dan LEZAT berdasarkan bahan yang diberikan pengguna.
    
    ATURAN PENTING (STRICT RULES):
    1. **INTERPRETASI MASAKAN**: Jika pengguna hanya memberikan bahan (misal: "ayam, nasi"), kamu WAJIB menebak masakan yang cocok (misal: "Nasi Goreng Ayam" atau "Nasi Ayam Hainan"). Jangan bertanya balik.
    2. **AUTO-LENGKAPI BAHAN**: Kamu WAJIB menambahkan bumbu-bumbu dasar (pantry staples) yang biasanya dibutuhkan meskipun pengguna tidak menuliskannya.
       - Contoh: Bawang merah, bawang putih, garam, gula, kecap, minyak goreng, cabai, merica, dll.
    3. **ESTIMASI TAKARAN**: Berikan estimasi takaran untuk setiap bahan (misal: "2 siung", "1 piring", "1 sdm").
    4. **LANGKAH MEMASAK SANGAT DETAIL (STEP-BY-STEP)**:
       - JANGAN menggabungkan semua proses dalam 1 langkah.
       - Pecah menjadi langkah-langkah kecil (Granular).
       - Minimal 5-7 langkah.
       - Contoh yang SALAH: "Tumis bumbu, masukkan ayam dan nasi, masak hingga matang." (INI TERLALU SINGKAT).
       - Contoh yang BENAR:
         1. Haluskan bawang merah, bawang putih, dan cabai.
         2. Panaskan sedikit minyak di wajan.
         3. Tumis bumbu halus hingga harum dan matang.
         4. Masukkan potongan ayam, masak hingga berubah warna.
         5. Masukkan nasi putih, aduk rata dengan bumbu.
         6. Tambahkan kecap manis, garam, dan lada. Koreksi rasa.
         7. Angkat dan sajikan selagi hangat.
    
    ATURAN BERPIKIR (THINKING MODE):
    Sebelum memberikan jawaban JSON final, analisis dulu bahan-bahannya dalam tag <thinking>...</thinking>.
    Pikirkan: "Masakan apa yang paling enak dengan bahan ini? Bumbu apa yang kurang? Bagaimana langkah memasak yang step-by-step?"
    Jaga thinking process tetap singkat (maksimal 2-3 kalimat).

    FORMAT OUTPUT (JSON ONLY):
    Berikan output HANYA dalam format JSON Array. Jangan ada teks pembuka/penutup lain di luar JSON.
    Struktur JSON:
    [
      {
        "title": "Nama Masakan (misal: Nasi Goreng Spesial)",
        "calories": 450,
        "protein": 20,
        "time": "15 min",
        "ingredients": ["2 piring Nasi Putih", "2 butir Telur", "3 siung Bawang Merah", "2 siung Bawang Putih", "1 sdm Kecap Manis", "Garam secukupnya"],
        "steps": [
          "Langkah 1: Persiapan bahan...",
          "Langkah 2: Proses menumis...",
          "Langkah 3: Proses memasak utama...",
          "...",
          "Langkah Terakhir: Penyajian"
        ]
      },
      ... (buat 3-4 variasi resep yang berbeda)
    ]
`;

export default function FitChef({ auth }) {
    // Current input text
    const [inputValue, setInputValue] = useState('');
    // List of added ingredient chips
    const [ingredients, setIngredients] = useState([]);

    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [thinkingProcess, setThinkingProcess] = useState('');
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    // Handle adding ingredients on Enter
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = inputValue.trim();
            if (val) {
                if (!ingredients.includes(val)) {
                    setIngredients([...ingredients, val]);
                }
                setInputValue('');
            }
        }
    };

    // Remove ingredient chip
    const removeIngredient = (ingToRemove) => {
        setIngredients(ingredients.filter(ing => ing !== ingToRemove));
    };

    const handleGenerate = async (e) => {
        e.preventDefault();

        // If there's text in input but not added to list yet, consider adding it or just warn.
        // For better UX, let's prioritize the list. If list is empty but input has text, use input.
        let finalIngredients = ingredients;
        if (ingredients.length === 0 && inputValue.trim()) {
            finalIngredients = [inputValue.trim()];
            setIngredients([inputValue.trim()]);
            setInputValue('');
        }

        if (finalIngredients.length === 0) return;

        setLoading(true);
        setError(null);
        setRecipes([]);
        setThinkingProcess('');

        try {
            const groq = new Groq({
                apiKey: import.meta.env.VITE_GROQ_API_KEY,
                dangerouslyAllowBrowser: true
            });

            // Join array to string
            const ingredientString = finalIngredients.join(', ');

            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Bahan-bahan yang saya miliki: ${ingredientString}` }
                ],
                model: MODEL_NAME,
                temperature: 0.7,
                max_tokens: MAX_TOKENS,
            });

            const content = completion.choices[0]?.message?.content || "";

            // Extract thinking process
            const thinkingMatch = content.match(/<thinking>([\s\S]*?)<\/thinking>/);
            if (thinkingMatch) {
                setThinkingProcess(thinkingMatch[1].trim());
            }

            // Extract and parse JSON
            const jsonMatch = content.replace(/<thinking>[\s\S]*?<\/thinking>/, '').match(/\[[\s\S]*\]/);

            if (jsonMatch) {
                try {
                    const parsedRecipes = JSON.parse(jsonMatch[0]);
                    setRecipes(parsedRecipes);
                } catch (parseError) {
                    console.error("JSON Parse Error:", parseError);
                    console.log("Raw Content:", content);
                    setError("Gagal memproses resep. Format data tidak valid.");
                }
            } else {
                setError("Maaf, gagal menghasilkan resep. Coba lagi.");
            }

        } catch (err) {
            console.error("Groq API Error:", err);
            setError(`Terjadi kesalahan: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = (recipe) => {
        const doc = new jsPDF();

        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text(recipe.title, 20, 20);

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`${recipe.calories} kcal | ${recipe.time} | ${recipe.protein}g Protein`, 20, 30);

        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("Ingredients", 20, 50);

        doc.setFontSize(12);
        let yPos = 60;
        recipe.ingredients.forEach(ing => {
            doc.text(`• ${ing}`, 25, yPos);
            yPos += 7;
        });

        yPos += 10;
        doc.setFontSize(16);
        doc.text("Instructions", 20, yPos);

        yPos += 10;
        doc.setFontSize(12);
        recipe.steps.forEach((step, index) => {
            const splitTitle = doc.splitTextToSize(`${index + 1}. ${step}`, 170);
            doc.text(splitTitle, 25, yPos);
            yPos += (splitTitle.length * 7) + 3;
        });

        doc.save(`${recipe.title.replace(/\s+/g, '_')}.pdf`);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">FitChef AI</h2>}
        >
            <Head title="FitChef AI" />

            <div className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Header Section */}
                    <div className="text-center mb-10">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                            FitChef AI Recipe Maker
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Enter the ingredients you have and let AI craft healthy, delicious recipes for your family.
                        </p>
                    </div>

                    {/* Input Card - Dark Themed as per Screenshot */}
                    <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl p-8 shadow-xl mb-12 border border-gray-700">
                        <form onSubmit={handleGenerate} className="flex flex-col gap-6">

                            {/* Input Field with Green Border Focus */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type an ingredient or dish (e.g., grilled chicken, broccoli)... press Enter to add"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-700/50 border border-emerald-500/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Ingredient Chips Area */}
                            {ingredients.length > 0 && (
                                <div className="flex flex-wrap gap-2 animate-fade-in">
                                    {ingredients.map((ing, idx) => (
                                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-900/30 text-emerald-100 border border-emerald-500/30 rounded-lg text-sm font-medium">
                                            <span>{ing}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeIngredient(ing)}
                                                className="text-emerald-400 hover:text-emerald-200 focus:outline-none"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading || (ingredients.length === 0 && !inputValue)}
                                    className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-full transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[180px]"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Generating...
                                        </>
                                    ) : (
                                        "Generate Recipes"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Thinking Process Display */}
                    {thinkingProcess && (
                        <div className="max-w-4xl mx-auto mb-8 p-4 bg-emerald-900/20 rounded-xl border border-emerald-800/50 animate-fade-in">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-400 mb-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                AI Thought Process
                            </h4>
                            <p className="text-sm text-emerald-200/80 italic">
                                "{thinkingProcess}"
                            </p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-900/20 text-red-200 rounded-xl border border-red-800/50 text-center">
                            {error}
                        </div>
                    )}

                    {/* Results Grid - Updated to match the darker aesthetic if needed, but keeping clean cards */}
                    {recipes.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto pb-12 animate-fade-in-up">
                            {recipes.map((recipe, index) => (
                                <div key={index} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-full hover:border-emerald-500/50 transition-all duration-300">
                                    {/* Header Card */}
                                    <div className="p-6 pb-4 flex-1">
                                        <div className="mb-4">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                                                {recipe.title}
                                            </h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            <span className="px-2.5 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-md border border-orange-100 dark:border-orange-800">
                                                {recipe.calories} kcal
                                            </span>
                                            <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-md border border-blue-100 dark:border-blue-800">
                                                {recipe.time}
                                            </span>
                                            <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-md border border-emerald-100 dark:border-emerald-800">
                                                {recipe.protein}g protein
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Main Ingredients</p>
                                            <div className="flex flex-wrap gap-2">
                                                {recipe.ingredients.slice(0, 4).map((ing, i) => (
                                                    <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-1.5 rounded-full">
                                                        {ing.split(' ').slice(0, 2).join(' ')}
                                                    </span>
                                                ))}
                                                {recipe.ingredients.length > 4 && (
                                                    <span className="text-xs text-gray-400 px-1 py-1">+{recipe.ingredients.length - 4} more</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Button */}
                                    <div className="p-6 pt-0 mt-4">
                                        <button
                                            onClick={() => setSelectedRecipe(recipe)}
                                            className="w-full py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-emerald-500 hover:text-white text-gray-600 dark:text-gray-300 font-semibold rounded-xl transition-all duration-300"
                                        >
                                            View Recipe Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* RECIPE MODAL - Vertical Stack (Dashboard Style) */}
            <RecipeModal
                recipe={selectedRecipe}
                onClose={() => setSelectedRecipe(null)}
                onDownload={() => handleDownloadPDF(selectedRecipe)}
            />

        </AuthenticatedLayout>
    );
}

// ----------------------------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------------------------

const RecipeModal = ({ recipe, onClose, onDownload }) => {
    if (!recipe) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative border border-gray-200 dark:border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Section */}
                <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
                            {recipe.title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Badges Flow */}
                    <div className="flex flex-wrap gap-3">
                        <Badge color="orange" icon="🔥" label={`${recipe.calories} kcal`} />
                        <Badge color="blue" icon="⏰" label={recipe.time} />
                        <Badge color="emerald" icon="💪" label={`${recipe.protein}g Protein`} />
                    </div>
                </div>

                {/* Content Section - Vertical Stack (Single Column) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-8">

                    {/* Ingredients Section */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
                            Bahan-bahan
                        </h3>
                        <div className="bg-orange-50/50 dark:bg-orange-900/10 p-5 rounded-2xl border border-orange-100 dark:border-orange-800/30">
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {recipe.ingredients.map((ing, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-gray-700 dark:text-gray-300 text-sm font-medium">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0"></span>
                                        <span>{ing}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Instructions Section */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                            <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                            Cara Membuat
                        </h3>
                        <div className="space-y-6 relative pl-2">
                            {/* Vertical Line */}
                            <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-100 dark:bg-gray-700"></div>

                            {recipe.steps.map((step, idx) => (
                                <div key={idx} className="relative flex gap-5 group">
                                    {/* Number Bubble */}
                                    <div className="relative z-10 w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 border-2 border-emerald-500 text-emerald-600 font-bold shadow-sm">
                                        {idx + 1}
                                    </div>
                                    {/* Step Content */}
                                    <div className="flex-1 pt-1.5">
                                        <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-[15px]">
                                            {step}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Footer Section */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 flex justify-end gap-3">
                    <button
                        onClick={onDownload}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download PDF
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

const Badge = ({ color, icon, label }) => {
    const colorClasses = {
        orange: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-100 dark:border-orange-800",
        blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-100 dark:border-blue-800",
        emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800",
    };

    return (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${colorClasses[color]} text-sm font-semibold`}>
            <span>{icon}</span>
            <span>{label}</span>
        </div>
    );
};
