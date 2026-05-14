<?php

namespace App\Http\Controllers;

use App\Models\MealPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class MealPlanController extends Controller
{
    public function index(Request $request)
    {
        $user   = auth()->user();
        $myself = $user->familyMembers->where('linked_user_id', $user->id)->first()
            ?? $user->familyMembers->where('name', 'You')->first()
            ?? $user->familyMembers->first();

        $weekStart = $request->query('week_start')
            ? \Carbon\Carbon::parse($request->query('week_start'))->startOfWeek(\Carbon\Carbon::MONDAY)
            : now()->startOfWeek(\Carbon\Carbon::MONDAY);

        $weekEnd = $weekStart->copy()->endOfWeek(\Carbon\Carbon::SUNDAY);

        $plans = MealPlan::where('family_member_id', $myself?->id)
            ->whereBetween('planned_date', [$weekStart->toDateString(), $weekEnd->toDateString()])
            ->get()
            ->groupBy(fn($p) => $p->planned_date->toDateString());

        $days = [];
        for ($i = 0; $i < 7; $i++) {
            $date    = $weekStart->copy()->addDays($i);
            $dateStr = $date->toDateString();
            $days[]  = [
                'date'       => $dateStr,
                'label'      => $date->format('D'),
                'full_label' => $date->format('D, M j'),
                'meals'      => $plans->get($dateStr, collect())->values(),
            ];
        }

        return Inertia::render('MealPlanner', [
            'days'         => $days,
            'weekStart'    => $weekStart->toDateString(),
            'weekEnd'      => $weekEnd->toDateString(),
            'calorieGoal'  => $myself?->daily_calorie_goal ?? 2000,
            'familyMember' => $myself,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'planned_date' => 'required|date',
            'meal_type'    => 'required|in:breakfast,lunch,dinner,snack',
            'name'         => 'required|string|max:255',
            'calories'     => 'nullable|integer|min:0',
            'protein'      => 'nullable|numeric|min:0',
            'carbs'        => 'nullable|numeric|min:0',
            'fat'          => 'nullable|numeric|min:0',
            'notes'        => 'nullable|string|max:500',
        ]);

        $user   = auth()->user();
        $myself = $user->familyMembers->where('linked_user_id', $user->id)->first()
            ?? $user->familyMembers->first();

        MealPlan::create(array_merge($validated, [
            'family_member_id' => $myself->id,
        ]));

        return back()->with('success', 'Meal plan berhasil ditambahkan.');
    }

    public function generate(Request $request)
    {
        $request->validate([
            'week_start' => 'required|date',
            'mode'       => 'required|in:replace,fill',
        ]);

        $user   = auth()->user();
        $myself = $user->familyMembers->where('linked_user_id', $user->id)->first()
            ?? $user->familyMembers->where('name', 'You')->first()
            ?? $user->familyMembers->first();

        if (!$myself) {
            return back()->withErrors(['error' => 'Profil anggota tidak ditemukan.']);
        }

        $weekStart = \Carbon\Carbon::parse($request->week_start)->startOfWeek(\Carbon\Carbon::MONDAY);
        $weekEnd   = $weekStart->copy()->endOfWeek(\Carbon\Carbon::SUNDAY);

        // Build list of 7 dates for the week
        $dates = [];
        for ($i = 0; $i < 7; $i++) {
            $dates[] = $weekStart->copy()->addDays($i)->toDateString();
        }

        // Get existing plans this week
        $existing = MealPlan::where('family_member_id', $myself->id)
            ->whereBetween('planned_date', [$weekStart->toDateString(), $weekEnd->toDateString()])
            ->get();

        if ($request->mode === 'replace') {
            // Delete all existing plans for the week, then fill all slots
            $existing->each->delete();
            $slotsNeeded = $this->buildAllSlots($dates);
        } else {
            // fill mode: only generate for empty slots (date+meal_type combos)
            $occupiedSlots = $existing
                ->map(fn($p) => $p->planned_date->toDateString() . '|' . $p->meal_type)
                ->toArray();
            $slotsNeeded = $this->buildAllSlots($dates, $occupiedSlots);

            if (empty($slotsNeeded)) {
                return back()->with('success', 'Semua slot sudah terisi! Tidak ada yang perlu ditambahkan.');
            }
        }

        // ── Build AI prompt context ──────────────────────────────────────────
        $calorieGoal = $myself->daily_calorie_goal ?? 2000;
        $healthGoal  = $myself->health_goal ?? 'maintenance';
        $allergies   = $myself->allergies ?? [];
        $ageCategory = $myself->age_category ?? 'Adult';

        $goalLabel = match ($healthGoal) {
            'loss'        => 'menurunkan berat badan (defisit kalori, prioritaskan protein tinggi dan serat)',
            'gain'        => 'menaikkan berat badan (surplus kalori, fokus protein dan karbohidrat kompleks)',
            'growth'      => 'pertumbuhan optimal anak/remaja (kalori cukup, protein tinggi, kalsium)',
            'maintenance' => 'menjaga berat badan ideal (seimbang antara protein, karbo, lemak sehat)',
            default       => 'menjaga kesehatan',
        };

        $allergiesText = empty($allergies) ? 'tidak ada' : implode(', ', $allergies);
        $slotsJson     = json_encode($slotsNeeded, JSON_PRETTY_PRINT);

        // Breakdown kalori per meal type
        $breakfastCal = round($calorieGoal * 0.25);
        $lunchCal     = round($calorieGoal * 0.35);
        $dinnerCal    = round($calorieGoal * 0.30);
        $snackCal     = round($calorieGoal * 0.10);

        $prompt = <<<PROMPT
Kamu adalah ahli gizi klinis bersertifikat yang merancang meal plan medis sehat dan lezat untuk aplikasi nutrisi.

## Profil Pengguna
- Target kalori harian: {$calorieGoal} kkal
- Tujuan: {$goalLabel}
- Alergi/pantangan: {$allergiesText}
- Kategori usia: {$ageCategory}

## Target Kalori per Waktu Makan
- Sarapan (breakfast): ~{$breakfastCal} kkal
- Makan siang (lunch): ~{$lunchCal} kkal
- Makan malam (dinner): ~{$dinnerCal} kkal
- Snack: ~{$snackCal} kkal

## Slot yang Harus Diisi
{$slotsJson}

## ATURAN WAJIB — BACA DENGAN SEKSAMA

### SARAPAN (breakfast) — harus bergizi dan mengenyangkan:
✅ BOLEH: oatmeal dengan buah, roti gandum + telur, bubur ayam tanpa santan, nasi merah + protein, smoothie bowl, yogurt granola, telur rebus/dadar + sayur, nasi putih + tempe/ikan/telur + lalapan
❌ DILARANG: makanan gorengan berat, mi instan, makanan manis olahan

### MAKAN SIANG (lunch) — sumber energi utama, harus berprotein:
✅ BOLEH: nasi merah/putih + ayam panggang/bakar/rebus, nasi + ikan kukus/bakar, sayur bening, sup ayam, pecel ayam, gado-gado, soto ayam (bukan soto jeroan), capcay, tumis sayur + protein, lontong sayur (kuah bening)
❌ DILARANG KERAS: nasi goreng (mengandung minyak berlebih), makanan yang mayoritas digoreng, fastfood

### MAKAN MALAM (dinner) — lebih ringan dari makan siang:
✅ BOLEH: sup ikan/ayam, tim ikan, tumis brokoli + tahu, ayam kukus, ikan bakar + lalapan, sayur bening, omelet sayur, nasi lebih sedikit dari makan siang
❌ DILARANG: makanan berat dan berminyak menjelang tidur

### SNACK — harus benar-benar camilan sehat, BUKAN sayuran mentah biasa:
✅ BOLEH HANYA INI: 
  - Buah segar: pisang, apel, pepaya, mangga, semangka, jeruk, pir, anggur, jambu biji, melon (BUKAN kolang-kaling)
  - Kacang-kacangan: kacang almond, kacang mete, edamame kukus, kacang hijau rebus
  - Produk susu rendah lemak: yogurt plain, susu rendah lemak, keju rendah lemak
  - Cemilan bergizi: roti gandum, smoothie buah, ubi kukus, jagung rebus, tempe kukus
❌ DILARANG KERAS untuk snack: kol mentah, kolang-kaling, singkong mentah, sayuran tidak diolah

### ATURAN UMUM:
- Variasikan protein setiap hari: ayam, ikan, tahu, tempe, telur, kacang-kacangan (rotasi)
- Jangan ulangi menu yang sama 2 hari berturut-turut
- Masakan yang direbus/dikukus/dipanggang lebih diutamakan dari yang digoreng
- Sertakan sayuran dalam setiap makan besar
- Alergi yang harus dihindari: {$allergiesText}

## Format Output
Kembalikan HANYA JSON valid (tanpa markdown, tanpa komentar, tanpa penjelasan) dengan format persis:
{
  "meals": [
    {
      "planned_date": "YYYY-MM-DD",
      "meal_type": "breakfast|lunch|dinner|snack",
      "name": "Nama Makanan Spesifik",
      "calories": 350,
      "protein": 20,
      "carbs": 40,
      "fat": 8,
      "notes": "Cara penyajian singkat, manfaat gizi utama"
    }
  ]
}
PROMPT;

        // ── Call Groq API ────────────────────────────────────────────────────
        $apiKey   = config('services.groq.key');
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type'  => 'application/json',
        ])->timeout(60)->post('https://api.groq.com/openai/v1/chat/completions', [
            'model'       => 'llama-3.1-8b-instant',
            'temperature' => 0.7,
            'max_tokens'  => 4096,
            'messages'    => [
                [
                    'role'    => 'system',
                    'content' => 'Kamu adalah ahli gizi Indonesia. Selalu kembalikan JSON valid tanpa markdown.',
                ],
                [
                    'role'    => 'user',
                    'content' => $prompt,
                ],
            ],
        ]);

        if (!$response->successful()) {
            return back()->withErrors(['error' => 'Gagal menghubungi AI. Coba lagi dalam beberapa saat.']);
        }

        $content = $response->json('choices.0.message.content', '');

        // Strip markdown code fences if model adds them
        $content = preg_replace('/^```json\s*/i', '', trim($content));
        $content = preg_replace('/\s*```$/', '', $content);

        $parsed = json_decode($content, true);

        if (!$parsed || !isset($parsed['meals']) || !is_array($parsed['meals'])) {
            return back()->withErrors(['error' => 'AI mengembalikan format yang tidak valid. Coba lagi.']);
        }

        // ── Bulk insert valid meals ──────────────────────────────────────────
        $inserted = 0;
        foreach ($parsed['meals'] as $meal) {
            if (!in_array($meal['planned_date'] ?? '', $dates)) continue;
            if (!in_array($meal['meal_type'] ?? '', ['breakfast', 'lunch', 'dinner', 'snack'])) continue;

            MealPlan::create([
                'family_member_id' => $myself->id,
                'planned_date'     => $meal['planned_date'],
                'meal_type'        => $meal['meal_type'],
                'name'             => substr($meal['name'] ?? 'Makanan Sehat', 0, 255),
                'calories'         => isset($meal['calories']) ? (int)   $meal['calories'] : null,
                'protein'          => isset($meal['protein'])  ? (float) $meal['protein']  : null,
                'carbs'            => isset($meal['carbs'])    ? (float) $meal['carbs']    : null,
                'fat'              => isset($meal['fat'])      ? (float) $meal['fat']      : null,
                'notes'            => isset($meal['notes'])    ? substr($meal['notes'], 0, 500) : null,
            ]);
            $inserted++;
        }

        $modeLabel = $request->mode === 'replace' ? 'diganti dengan' : 'ditambahkan';
        return back()->with('success', "✨ AI berhasil membuat {$inserted} rencana makan! Meal plan minggu ini telah {$modeLabel} rekomendasi AI.");
    }

    public function destroy($id)
    {
        $plan = MealPlan::findOrFail($id);
        $user = auth()->user();

        $memberIds = $user->familyMembers->pluck('id');
        if (!$memberIds->contains($plan->family_member_id)) {
            abort(403);
        }

        $plan->delete();

        return back()->with('success', 'Meal plan berhasil dihapus.');
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Build all date×meal_type slot combos, excluding already-occupied ones.
     *
     * @param  string[] $dates          ISO date strings for the week
     * @param  string[] $occupiedSlots  "YYYY-MM-DD|meal_type" keys to skip
     * @return array<array{planned_date: string, meal_type: string}>
     */
    private function buildAllSlots(array $dates, array $occupiedSlots = []): array
    {
        $mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
        $slots     = [];

        foreach ($dates as $date) {
            foreach ($mealTypes as $type) {
                if (!in_array("{$date}|{$type}", $occupiedSlots)) {
                    $slots[] = ['planned_date' => $date, 'meal_type' => $type];
                }
            }
        }

        return $slots;
    }
}
