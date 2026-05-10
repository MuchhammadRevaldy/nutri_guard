<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;

class FitChefController extends Controller
{
    public function index()
    {
        $user   = auth()->user();
        $myself = $user->familyMembers->where('linked_user_id', $user->id)->first()
            ?? $user->familyMembers->where('name', 'You')->first()
            ?? $user->familyMembers->first();

        // Remaining calories for today
        $todayCalories   = $myself ? $myself->foodLogs()->whereDate('eaten_at', now())->sum('calories') : 0;
        $calorieGoal     = $myself?->daily_calorie_goal ?? 2000;
        $remainingCalories = max(0, $calorieGoal - $todayCalories);

        // Allergies from user's profile
        $allergies = $myself?->allergies ?? [];

        return Inertia::render('FitChef', [
            'remainingCalories' => $remainingCalories,
            'calorieGoal'       => $calorieGoal,
            'allergies'         => $allergies,
        ]);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'ingredients'   => 'required|array',
            'ingredients.*' => 'string',
            'count'         => 'sometimes|integer|min:1|max:12',
        ]);

        $user   = auth()->user();
        $myself = $user->familyMembers->where('linked_user_id', $user->id)->first()
            ?? $user->familyMembers->where('name', 'You')->first()
            ?? $user->familyMembers->first();

        // Calorie budget & allergen context
        $todayCalories     = $myself ? $myself->foodLogs()->whereDate('eaten_at', now())->sum('calories') : 0;
        $calorieGoal       = $myself?->daily_calorie_goal ?? 2000;
        $remainingCalories = max(0, $calorieGoal - $todayCalories);
        $allergies         = $myself?->allergies ?? [];

        $ingredients = implode(', ', $request->input('ingredients'));
        $apiKey      = env('GEMINI_API_KEY', env('VITE_GEMINI_API_KEY'));

        $count = $request->input('count');
        if ($count === null) {
            $count = random_int(6, 12);
        }
        $count = max(1, min(12, (int) $count));

        // Build allergen constraint string
        $allergenClause = '';
        if (!empty($allergies)) {
            $allergenClause = 'PENTING: Resep WAJIB bebas dari alergen berikut: ' . implode(', ', $allergies) . '. Jangan gunakan bahan-bahan tersebut sama sekali.';
        }

        // Build calorie constraint
        $calorieClause = "Setiap resep WAJIB memiliki kalori di bawah {$remainingCalories} kkal (sisa kuota kalori harian pengguna). Jangan buat resep yang melebihi batas ini.";

        $prompt = "Anda adalah ahli gizi dan koki profesional. Buat {$count} resep sehat yang berbeda menggunakan bahan-bahan berikut (ditambah bahan dapur dasar): {$ingredients}.
        {$allergenClause}
        {$calorieClause}
        Kembalikan keluaran HANYA berupa array JSON mentah (tanpa markdown) berisi tepat {$count} item dengan struktur objek:
        - title (string)
        - calories (integer, perkiraan per porsi)
        - protein (integer, gram per porsi)
        - time (string, mis. '40 menit')
        - ingredients (array of strings, daftar bahan lengkap)
        - steps (array berisi 12–16 string, sangat rinci)
        Pastikan resep cocok untuk keluarga dan gunakan bahasa Indonesia.";

        try {
            $response = Http::post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    ['parts' => [['text' => $prompt]]]
                ]
            ]);

            if ($response->failed()) {
                \Illuminate\Support\Facades\Log::error('Gemini API Error', $response->json());
                return $this->getMockRecipes($ingredients, $count, $remainingCalories);
            }

            $rawText = $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? '[]';
            $rawText = str_replace(['```json', '```'], '', $rawText);

            $recipes = json_decode($rawText, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json(['error' => 'Format resep tidak valid dari AI.', 'raw' => $rawText], 500);
            }

            // Filter recipes that exceed remaining calories (Business Rule #2)
            $filtered = array_filter($recipes, fn($r) => ($r['calories'] ?? 9999) <= $remainingCalories);

            return response()->json([
                'recipes'           => array_values($filtered ?: $recipes), // fallback if all filtered
                'remainingCalories' => $remainingCalories,
                'allergies'         => $allergies,
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('FitChef Exception', ['msg' => $e->getMessage()]);
            return $this->getMockRecipes($ingredients, $count, $remainingCalories);
        }
    }

    private function getMockRecipes($ingredients, $count = 6, $remainingCalories = 2000)
    {
        $bases = [
            ['Tumis Sehat (Demo)', 350, '25 menit', 22],
            ['Salad Segar (Demo)', 280, '15 menit', 15],
            ['Panggang Lezat (Demo)', 380, '40 menit', 30],
            ['Sup Hangat (Demo)', 320, '35 menit', 18],
            ['Pasta Malam (Demo)', 420, '30 menit', 20],
            ['Mangkok Gandum (Demo)', 400, '25 menit', 25],
            ['Wrap Sehat (Demo)', 350, '20 menit', 19],
            ['Tumis Kentang (Demo)', 400, '28 menit', 12],
        ];

        $recipes = [];
        for ($i = 0; $i < $count; $i++) {
            $b     = $bases[$i % count($bases)];
            $style = strtolower($b[0]);

            $steps = [
                'Baca resep dan siapkan semua peralatan yang dibutuhkan.',
                'Cuci dan bersihkan semua bahan makanan dengan air mengalir.',
                'Potong dan siapkan bahan sesuai ukuran yang dibutuhkan.',
                'Panaskan wajan/panci dengan api sedang.',
                'Tambahkan minyak secukupnya.',
                'Tumis bumbu dasar hingga harum (bawang putih, bawang merah).',
                'Masukkan bahan utama: ' . $ingredients . '.',
                'Aduk rata dan masak hingga setengah matang.',
                'Tambahkan bumbu dan rempah sesuai selera.',
                'Cicipi dan sesuaikan rasa.',
                'Masak hingga matang sempurna.',
                'Sajikan panas dengan taburan herba segar.',
            ];

            $recipes[] = [
                'title'       => $b[0],
                'calories'    => $b[1],
                'protein'     => $b[3],
                'time'        => $b[2],
                'ingredients' => explode(', ', $ingredients . ', Bumbu dasar, Minyak goreng, Garam, Merica'),
                'steps'       => $steps,
            ];
        }

        // Filter by remaining calories
        $filtered = array_filter($recipes, fn($r) => $r['calories'] <= $remainingCalories);

        return response()->json([
            'recipes'           => array_values($filtered ?: $recipes),
            'remainingCalories' => $remainingCalories,
        ]);
    }
}
