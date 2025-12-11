<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;

class FitChefController extends Controller
{
    public function index()
    {
        return Inertia::render('FitChef');
    }

    public function generate(Request $request)
    {
        $request->validate([
            'ingredients' => 'required|array',
            'ingredients.*' => 'string',
            'count' => 'sometimes|integer|min:1|max:12'
        ]);

        $ingredients = implode(', ', $request->input('ingredients'));
        $apiKey = env('GEMINI_API_KEY', env('VITE_GEMINI_API_KEY'));
        $count = $request->input('count');
        if ($count === null) {
            $count = random_int(6, 12);//jumlah card resep menu
        }
        $count = max(1, min(12, (int) $count));

        $prompt = "Anda adalah ahli gizi dan koki profesional. Buat $count resep sehat yang berbeda menggunakan bahan-bahan berikut (ditambah bahan dapur dasar): $ingredients.
        Kembalikan keluaran HANYA berupa array JSON mentah (tanpa markdown) berisi tepat $count item dengan struktur objek:
        - title (string)
        - calories (integer, perkiraan)
        - time (string, mis. '40 menit')
        - ingredients (array of strings, daftar bahan lengkap)
        - steps (array berisi 12–16 string, sangat rinci: persiapan, marinasi, memasak, finishing, resting, penyajian)
        Pastikan resep cocok untuk keluarga dan gunakan bahasa Indonesia.";

        try {
            $response = Http::post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    ['parts' => [['text' => $prompt]]]
                ]
            ]);

            if ($response->failed()) {
                \Illuminate\Support\Facades\Log::error('Gemini API Error', $response->json());
                return $this->getMockRecipes($ingredients, $count);
            }

            $rawText = $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? '[]';

            // Clean Markdown code blocks if API sends them
            $rawText = str_replace(['```json', '```'], '', $rawText);

            $recipes = json_decode($rawText, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json(['error' => 'AI generation format error.', 'raw' => $rawText], 500);
            }

            return response()->json([
                'recipes' => $recipes
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('FitChef Exception', ['msg' => $e->getMessage()]);
            return $this->getMockRecipes($ingredients, $count);
        }
    }
    private function getMockRecipes($ingredients, $count = 6)
    {
        $bases = [
            ['Tumis Sehat (Mode Demo)', 450, '25 menit'],
            ['Salad Segar (Mode Demo)', 320, '15 menit'],
            ['Panggang Lezat (Mode Demo)', 400, '40 menit'],
            ['Sup Hangat (Mode Demo)', 380, '35 menit'],
            ['Pasta Malam (Mode Demo)', 520, '30 menit'],
            ['Mangkok Gandum (Mode Demo)', 480, '25 menit'],
            ['Wrap Sehat (Mode Demo)', 430, '20 menit'],
            ['Tumis Kentang (Mode Demo)', 500, '28 menit']
        ];

        $recipes = [];
        for ($i = 0; $i < $count; $i++) {
            $b = $bases[$i % count($bases)];
            $title = $b[0];
            $style = strtolower($title);

            // Extra ingredients per style
            if (str_contains($style, 'tumis sehat')) {
                $extra = ', Bawang Putih, Kecap Asin, Daun Bawang';
                $steps = [
                    'Baca resep dan siapkan peralatan.',
                    'Cuci dan keringkan bahan; iris sayuran tipis dan merata.',
                    'Iris atau potong protein menjadi ukuran gigitan.',
                    'Kocok saus: kecap asin, sedikit air, sejumput gula, opsional tepung maizena.',
                    'Panaskan wajan/wok api besar hingga sangat panas.',
                    'Tambah minyak; tumis protein 1–2 menit hingga kecokelatan; angkat.',
                    'Masukkan bawang putih dan daun bawang; aduk 30–45 detik hingga harum.',
                    'Tambahkan sayuran; aduk terus 2–3 menit hingga renyah-lunak.',
                    'Kembalikan protein; tuang saus dan aduk cepat.',
                    'Masak 1–2 menit hingga saus mengental dan melapisi rata.',
                    'Cicipi dan sesuaikan; tambah lada atau kecap bila perlu.',
                    'Akhiri dengan minyak wijen; diamkan 1 menit, sajikan di atas nasi.'
                ];
            } elseif (str_contains($style, 'salad')) {
                $extra = ', Air Lemon, Minyak Zaitun, Kacang';
                $steps = [
                    'Cuci daun hijau dan keringkan hingga benar-benar kering.',
                    'Iris sayuran renyah seragam berukuran gigitan.',
                    'Sangrai kacang atau biji 2–3 menit untuk aroma.',
                    'Siapkan mangkuk besar dan alat pencampur.',
                    'Kocok dressing: air lemon, minyak zaitun, garam, lada, sedikit madu.',
                    'Masukkan ' . $ingredients . ' ke mangkuk.',
                    'Tuang dressing; aduk perlahan hingga tercampur rata.',
                    'Tambahkan kacang/biji sangrai; aduk lagi untuk tekstur.',
                    'Diamkan 5–7 menit agar rasa menyatu.',
                    'Cicipi dan sesuaikan keasaman atau garam.',
                    'Tambahkan herba segar sebagai finishing.',
                    'Sajikan dingin.'
                ];
            } elseif (str_contains($style, 'panggang')) {
                $extra = ', Herba, Bawang Putih, Lemon';
                $steps = [
                    'Panaskan oven ke 200°C; siapkan loyang beralas kertas panggang.',
                    'Potong sayuran merata untuk kematangan seragam.',
                    'Geprek bawang putih; cincang herba.',
                    'Campur ' . $ingredients . ' dengan minyak, garam, lada, herba, bawang putih.',
                    'Sebarkan satu lapis di loyang.',
                    'Panggang 15 menit; balik atau kocok loyang.',
                    'Lanjut panggang 10–20 menit hingga keemasan dan empuk.',
                    'Cek kematangan dengan menusuk bagian tebal.',
                    'Akhiri dengan perasan lemon untuk kesegaran.',
                    'Taburi herba segar untuk aroma.',
                    'Diamkan 2–3 menit agar uap mereda.',
                    'Sajikan hangat sebagai lauk atau di atas gandum.'
                ];
            } elseif (str_contains($style, 'sup')) {
                $extra = ', Kaldu, Bawang, Bawang Putih';
                $steps = [
                    'Potong dadu bawang dan cincang bawang putih.',
                    'Siapkan panci dan ukur kaldu.',
                    'Tumis bawang dan bawang putih dengan sedikit garam hingga bening.',
                    'Tambahkan ' . $ingredients . ' dan aduk 1–2 menit hingga terlapisi.',
                    'Tuang kaldu; didihkan perlahan.',
                    'Kecilkan api dan masak 15–25 menit.',
                    'Buang buih bila perlu.',
                    'Cicipi dan sesuaikan garam, lada, dan asam.',
                    'Masukkan herba segar menjelang akhir.',
                    'Diamkan 2 menit agar rasa menyatu.',
                    'Siapkan mangkuk saji.',
                    'Sajikan panas.'
                ];
            } elseif (str_contains($style, 'pasta')) {
                $extra = ', Pasta, Tomat, Parmesan';
                $steps = [
                    'Didihkan panci besar berisi air garam.',
                    'Masak pasta hingga al dente; sisakan sedikit air rebusan.',
                    'Tumis aromatik; tambahkan ' . $ingredients . ' dan tomat.',
                    'Didihkan saus 8–12 menit hingga sedikit kental.',
                    'Bumbui saus dan cicipi.',
                    'Aduk pasta dengan saus menggunakan air rebusan untuk emulsi.',
                    'Tambahkan minyak zaitun.',
                    'Taburi parmesan dan herba.',
                    'Diamkan 1 menit agar menyerap.',
                    'Siapkan piring saji.',
                    'Sajikan segera.',
                    'Nikmati selagi hangat.'
                ];
            } elseif (str_contains($style, 'gandum')) {
                $extra = ', Gandum Matang, Tahini, Sayuran Hijau';
                $steps = [
                    'Masak gandum hingga mengembang; dinginkan sebentar.',
                    'Siapkan sayuran dan daun hijau.',
                    'Kocok saus tahini dengan lemon, garam, dan air secukupnya hingga encer.',
                    'Siapkan mangkok saji.',
                    'Susun gandum sebagai dasar.',
                    'Tambahkan ' . $ingredients . ' dan hijauan.',
                    'Tuang saus tahini.',
                    'Tambahkan topping renyah.',
                    'Cicipi dan sesuaikan garam atau lemon.',
                    'Taburi herba segar.',
                    'Diamkan 1–2 menit.',
                    'Sajikan hangat atau suhu ruang.'
                ];
            } elseif (str_contains($style, 'wrap')) {
                $extra = ', Tortilla, Selada, Saus Yogurt';
                $steps = [
                    'Hangatkan tortilla hingga lentur.',
                    'Siapkan bahan isian dan saus.',
                    'Masak atau susun isian menggunakan ' . $ingredients . '.',
                    'Oles saus yogurt di tortilla.',
                    'Tambahkan selada dan isian.',
                    'Gulung rapat dari satu sisi.',
                    'Tekan ringan agar padat.',
                    'Potong dua.',
                    'Susun di piring saji.',
                    'Sajikan segera.',
                    'Tambahkan sambal atau saus lain jika suka.',
                    'Nikmati.'
                ];
            } else {
                $extra = ', Kentang, Bawang, Paprika';
                $steps = [
                    'Potong dadu kentang dan bawang secara merata.',
                    'Panaskan wajan dan tambahkan minyak.',
                    'Tumis bawang hingga harum.',
                    'Tambahkan kentang dengan paprika dan garam.',
                    'Masak sambil sesekali diaduk hingga renyah-lembut.',
                    'Tambahkan ' . $ingredients . ' dan aduk rata.',
                    'Cicipi dan sesuaikan bumbu.',
                    'Taburi herba segar.',
                    'Diamkan 1 menit.',
                    'Siapkan piring saji.',
                    'Sajikan panas.',
                    'Nikmati selagi hangat.'
                ];
            }

            $recipes[] = [
                'title' => $title,
                'calories' => $b[1],
                'time' => $b[2],
                'ingredients' => explode(', ', $ingredients . $extra),
                'steps' => $steps
            ];
        }

        return response()->json(['recipes' => $recipes]);
    }
}
