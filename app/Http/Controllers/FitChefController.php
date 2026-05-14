<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class FitChefController extends Controller
{
    public function index()
    {
        $user   = auth()->user();
        $myself = $user->familyMembers->where('linked_user_id', $user->id)->first()
            ?? $user->familyMembers->where('name', 'You')->first()
            ?? $user->familyMembers->first();

        $todayCalories     = $myself ? $myself->foodLogs()->whereDate('eaten_at', now())->sum('calories') : 0;
        $calorieGoal       = $myself?->daily_calorie_goal ?? 2000;
        $remainingCalories = max(0, $calorieGoal - $todayCalories);
        $allergies         = $myself?->allergies ?? [];

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

        $todayCalories     = $myself ? $myself->foodLogs()->whereDate('eaten_at', now())->sum('calories') : 0;
        $calorieGoal       = $myself?->daily_calorie_goal ?? 2000;
        $remainingCalories = max(0, $calorieGoal - $todayCalories);
        $allergies         = $myself?->allergies ?? [];

        $ingredients = implode(', ', $request->input('ingredients'));
        $apiKey      = env('GROQ_API_KEY', '');

        $count = max(1, min(12, (int) ($request->input('count') ?? random_int(6, 12))));

        $allergenClause = '';
        if (!empty($allergies)) {
            $allergenClause = 'PENTING: Resep WAJIB bebas dari alergen berikut: ' . implode(', ', $allergies) . '. Jangan gunakan bahan-bahan tersebut sama sekali.';
        }

        $calorieClause = "Setiap resep WAJIB memiliki kalori di bawah {$remainingCalories} kkal (sisa kuota kalori harian pengguna).";

        $prompt = "Anda adalah ahli gizi dan koki profesional berpengalaman. Buat {$count} resep sehat yang berbeda menggunakan bahan-bahan berikut (boleh ditambah bahan dapur dasar): {$ingredients}.
{$allergenClause}
{$calorieClause}

ATURAN PENTING:
1. Setiap bahan WAJIB memiliki takaran tepat: gram/ml/sdm/sdt/siung/buah/lembar/ikat/secukupnya. Contoh: \"200 gram ayam fillet, potong dadu 2 cm\", \"3 siung bawang putih, cincang halus\", \"2 sdm kecap manis\", \"1/2 sdt garam\"
2. Setiap langkah memasak WAJIB sangat detail: sebutkan suhu api (kecil/sedang/besar), durasi waktu, tanda kematangan, cara memotong, dan teknik memasak yang benar.
3. Minimal 15 langkah memasak per resep.

Kembalikan HANYA array JSON mentah (tanpa markdown, tanpa teks lain) berisi tepat {$count} objek:
- title (string, nama resep kreatif)
- servings (integer, jumlah porsi)
- calories (integer, per porsi)
- protein (integer, gram per porsi)
- carbs (integer, gram per porsi)
- fat (integer, gram per porsi)
- preparation_time (integer, menit persiapan)
- cooking_time (integer, menit memasak)
- ingredients (array of strings, dengan takaran tepat)
- steps (array of strings, minimal 15 langkah sangat detail)
- tips (string, 1 tips singkat dari koki)
Gunakan bahasa Indonesia.";

        try {
            if (empty($apiKey)) {
                Log::warning('FitChef: GROQ_API_KEY tidak tersedia, menggunakan mock recipes.');
                return $this->getMockRecipes($ingredients, $count, $remainingCalories);
            }

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Content-Type'  => 'application/json',
                'User-Agent'    => 'groq-php/1.0',
            ])->post('https://api.groq.com/openai/v1/chat/completions', [
                'model'       => 'llama-3.1-8b-instant',
                'messages'    => [['role' => 'user', 'content' => $prompt]],
                'temperature' => 0.7,
                'max_tokens'  => 4096,
            ]);

            if ($response->failed()) {
                Log::error('Groq API Error', ['status' => $response->status(), 'body' => $response->body()]);
                return $this->getMockRecipes($ingredients, $count, $remainingCalories);
            }

            $rawText = $response->json()['choices'][0]['message']['content'] ?? '[]';

            // Ekstrak JSON dari teks — cari [ atau { pertama
            if (preg_match('/(\[[\s\S]*\]|\{[\s\S]*\})/m', $rawText, $m)) {
                $rawText = $m[1];
            }

            // Bersihkan markdown code block jika ada
            $rawText = preg_replace('/```json\s*/i', '', $rawText);
            $rawText = preg_replace('/```\s*/',       '', $rawText);

            // Bersihkan nilai numerik yang punya satuan: "40g"→40, "15 menit"→15, "320 kkal"→320
            $rawText = preg_replace(
                '/"(calories|protein|carbs|fat|preparation_time|cooking_time|servings)"\s*:\s*"?(\d+(?:\.\d+)?)\s*[a-zA-Z]*"?/',
                '"$1": $2',
                $rawText
            );

            $rawText = trim($rawText);

            $recipes = json_decode($rawText, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('FitChef JSON parse error', ['raw' => substr($rawText, 0, 300)]);
                return $this->getMockRecipes($ingredients, $count, $remainingCalories);
            }

            // Groq kadang mengembalikan object tunggal {} alih-alih array [{}]
            if (is_array($recipes) && array_key_exists('title', $recipes)) {
                $recipes = [$recipes];
            }

            if (!is_array($recipes) || empty($recipes)) {
                return $this->getMockRecipes($ingredients, $count, $remainingCalories);
            }

            // Normalisasi: ingredients kadang berupa array of objects {name, quantity, unit}
            $recipes = array_map(function ($recipe) {
                if (!empty($recipe['ingredients'])) {
                    $recipe['ingredients'] = array_map(function ($ing) {
                        if (is_string($ing)) return $ing;
                        // Convert {name, quantity, preparation} → string
                        $qty  = $ing['quantity'] ?? $ing['amount'] ?? '';
                        $name = $ing['name'] ?? $ing['ingredient'] ?? '';
                        $prep = $ing['preparation'] ?? $ing['notes'] ?? '';
                        $str  = trim("$qty $name");
                        if ($prep) $str .= ", $prep";
                        return $str;
                    }, $recipe['ingredients']);
                }
                return $recipe;
            }, $recipes);

            $filtered = array_filter($recipes, fn($r) => ($r['calories'] ?? 9999) <= $remainingCalories);

            return response()->json([
                'recipes'           => array_values($filtered ?: $recipes),
                'remainingCalories' => $remainingCalories,
                'allergies'         => $allergies,
            ]);

        } catch (\Exception $e) {
            Log::error('FitChef Exception', ['msg' => $e->getMessage()]);
            return $this->getMockRecipes($ingredients, $count, $remainingCalories);
        }
    }

    private function getMockRecipes(string $ingredients, int $count = 6, int $remainingCalories = 2000): \Illuminate\Http\JsonResponse
    {
        $bases = [
            ['Tumis Sehat (Demo)',    350, 10, 15, 22],
            ['Salad Segar (Demo)',    280,  5, 10, 15],
            ['Panggang Lezat (Demo)', 380, 15, 25, 30],
            ['Sup Hangat (Demo)',     320, 10, 25, 18],
            ['Pasta Malam (Demo)',    420, 10, 20, 20],
            ['Mangkok Gandum (Demo)', 400, 10, 15, 25],
            ['Wrap Sehat (Demo)',     350,  5, 15, 19],
            ['Tumis Kentang (Demo)',  400, 10, 18, 12],
        ];

        $recipes = [];
        for ($i = 0; $i < $count; $i++) {
            $b = $bases[$i % count($bases)];
            $recipes[] = [
                'title'            => $b[0],
                'calories'         => $b[1],
                'protein'          => $b[4],
                'preparation_time' => $b[2],
                'cooking_time'     => $b[3],
                'ingredients'      => explode(', ', $ingredients . ', Bumbu dasar, Minyak, Garam, Merica'),
                'steps'            => [
                    'Siapkan semua bahan dan peralatan masak.',
                    'Cuci bersih semua bahan dengan air mengalir.',
                    'Potong bahan sesuai ukuran yang dibutuhkan.',
                    'Panaskan wajan dengan api sedang.',
                    'Tambahkan minyak secukupnya.',
                    'Tumis bumbu dasar hingga harum.',
                    'Masukkan bahan utama: ' . $ingredients . '.',
                    'Aduk rata dan masak hingga setengah matang.',
                    'Tambahkan bumbu dan rempah sesuai selera.',
                    'Cicipi dan sesuaikan rasa.',
                    'Masak hingga matang sempurna.',
                    'Sajikan panas dengan taburan herba segar.',
                ],
            ];
        }

        $filtered = array_filter($recipes, fn($r) => $r['calories'] <= $remainingCalories);

        return response()->json([
            'recipes'           => array_values($filtered ?: $recipes),
            'remainingCalories' => $remainingCalories,
        ]);
    }
}
