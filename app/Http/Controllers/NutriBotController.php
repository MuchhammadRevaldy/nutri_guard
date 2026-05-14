<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class NutriBotController extends Controller
{
    // Context tentang NutriGuard yang selalu dikirim ke AI
    private string $systemPrompt = <<<SYSTEM
Kamu adalah NutriBot, asisten AI cerdas dari aplikasi NutriGuard. Kamu berbicara dalam Bahasa Indonesia yang ramah, singkat, dan informatif.

NutriGuard adalah aplikasi manajemen nutrisi keluarga dengan fitur:
1. **Dashboard** - Ringkasan kalori harian, tracking makan, grafik mingguan, peringatan kesehatan
2. **NutriScan** - Scan foto makanan menggunakan AI PyTorch untuk mendeteksi kandungan nutrisi otomatis
3. **FitChef** - Rekomendasi resep sehat dari AI berdasarkan bahan yang dimiliki dan preferensi gizi
4. **Meal Planner** - Rencana makan mingguan manual + Generate AI otomatis 7 hari (menggunakan Groq AI), bisa klik makanan untuk lihat detail nutrisi
5. **Laporan** - Grafik nutrisi, riwayat mingguan, breakdown kalori per hari
6. **Family Chat** - Chat antar anggota keluarga dalam satu akun
7. **Pengaturan** - Profil, avatar, data anggota keluarga

Fitur AI di NutriGuard:
- NutriScan menggunakan model PyTorch yang sudah dilatih khusus untuk mendeteksi 100+ jenis makanan
- FitChef menggunakan Groq API (llama) untuk merekomendasikan resep
- Meal Planner AI bisa generate rencana makan sehat 7 hari sekaligus, dengan mode "Ganti Semua" atau "Tambah yang Kosong"
- NutriBot (kamu!) menggunakan Groq API untuk menjawab pertanyaan user

Kemampuanmu:
- Menjawab pertanyaan tentang fitur NutriGuard
- Memberikan tips nutrisi dan kesehatan
- Membantu user memahami cara pakai aplikasi
- Menjawab pertanyaan umum tentang gizi, kalori, dan pola makan sehat
- Memberikan motivasi dan saran gaya hidup sehat

Batasan:
- Kamu BUKAN dokter. Untuk diagnosis medis, selalu sarankan konsultasi ke dokter
- Jangan memberikan rekomendasi obat atau dosis medis
- Jawaban maksimal 3-4 kalimat kecuali diminta penjelasan lebih panjang
- Selalu ramah, positif, dan mendukung
SYSTEM;

    public function recipe(Request $request)
    {
        $request->validate([
            'meal_name' => 'required|string|max:255',
            'calories'  => 'nullable|integer',
            'meal_type' => 'required|in:breakfast,lunch,dinner',
        ]);

        $mealName    = $request->meal_name;
        $calories    = $request->calories ?? 'tidak diketahui';
        $mealTypeMap = ['breakfast' => 'Sarapan', 'lunch' => 'Makan Siang', 'dinner' => 'Makan Malam'];
        $mealLabel   = $mealTypeMap[$request->meal_type];

        $prompt = <<<PROMPT
Buatkan resep lengkap untuk menu {$mealLabel}: **{$mealName}** (sekitar {$calories} kkal).

Kembalikan HANYA JSON valid tanpa markdown, tanpa komentar, dengan format persis:
{
  "cook_time": "20 menit",
  "prep_time": "10 menit",
  "servings": "1 porsi",
  "difficulty": "Mudah",
  "ingredients": [
    "200g bahan 1",
    "1 sdm bahan 2"
  ],
  "steps": [
    "Langkah pertama yang jelas dan detail.",
    "Langkah kedua."
  ],
  "tips": "Satu tips singkat untuk hasil terbaik."
}

Aturan:
- Resep harus sesuai dengan nama makanan persis: {$mealName}
- Gunakan bahan yang mudah ditemukan di Indonesia
- Langkah-langkah harus jelas, singkat, dan bisa diikuti siapa saja
- Jumlah bahan dan langkah disesuaikan dengan kompleksitas masakan (minimal 3 langkah, maksimal 8 langkah)
- Waktu masak realistis
PROMPT;

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . config('services.groq.key'),
            'Content-Type'  => 'application/json',
        ])->timeout(30)->post('https://api.groq.com/openai/v1/chat/completions', [
            'model'       => 'llama-3.1-8b-instant',
            'temperature' => 0.5,
            'max_tokens'  => 1024,
            'messages'    => [
                ['role' => 'system', 'content' => 'Kamu adalah chef profesional Indonesia. Selalu kembalikan JSON valid tanpa markdown.'],
                ['role' => 'user',   'content' => $prompt],
            ],
        ]);

        if (!$response->successful()) {
            return response()->json(['error' => 'Gagal mengambil resep. Coba lagi.'], 500);
        }

        $content = $response->json('choices.0.message.content', '');
        $content = preg_replace('/^```json\s*/i', '', trim($content));
        $content = preg_replace('/\s*```$/', '', $content);
        $recipe  = json_decode($content, true);

        if (!$recipe || !isset($recipe['steps'])) {
            return response()->json(['error' => 'Format resep tidak valid. Coba lagi.'], 500);
        }

        return response()->json(['recipe' => $recipe]);
    }

    public function chat(Request $request)
    {
        $request->validate([
            'messages' => 'required|array|min:1|max:20',
            'messages.*.role'    => 'required|in:user,assistant',
            'messages.*.content' => 'required|string|max:1000',
        ]);

        $apiKey = config('services.groq.key');

        $messages = array_map(fn($m) => [
            'role'    => $m['role'],
            'content' => $m['content'],
        ], $request->messages);

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type'  => 'application/json',
        ])->timeout(30)->post('https://api.groq.com/openai/v1/chat/completions', [
            'model'       => 'llama-3.1-8b-instant',
            'temperature' => 0.7,
            'max_tokens'  => 512,
            'messages'    => array_merge(
                [['role' => 'system', 'content' => $this->systemPrompt]],
                $messages
            ),
        ]);

        if (!$response->successful()) {
            return response()->json(['error' => 'Maaf, saya sedang tidak bisa merespons. Coba lagi sebentar.'], 500);
        }

        $reply = $response->json('choices.0.message.content', 'Maaf, tidak ada respons.');

        return response()->json(['reply' => $reply]);
    }
}
