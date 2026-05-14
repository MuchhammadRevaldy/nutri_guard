<?php

namespace App\Http\Controllers;

use App\Models\ScanQuota;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Process;
use Inertia\Inertia;

class NutriScanController extends Controller
{
    const MAX_SCANS_PER_DAY = 20;

    public function index()
    {
        $user  = auth()->user();
        $quota = $this->getTodayQuota($user);

        return Inertia::render('NutriScan', [
            'analysis'       => session('analysis'),
            'error'          => session('error'),
            'scansUsed'      => $quota->scan_count,
            'scansRemaining' => max(0, self::MAX_SCANS_PER_DAY - $quota->scan_count),
            'maxScans'       => self::MAX_SCANS_PER_DAY,
        ]);
    }

    public function analyze(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png|max:5120',
        ]);

        $user  = auth()->user();
        $quota = $this->getTodayQuota($user);

        if ($quota->scan_count >= self::MAX_SCANS_PER_DAY) {
            return redirect()->route('nutriscan.index')
                ->with('error', 'Batas scan harian (' . self::MAX_SCANS_PER_DAY . 'x) sudah tercapai. Coba lagi besok.');
        }

        $path         = $request->file('image')->store('nutriscan', 'public');
        $absolutePath = storage_path('app/public/' . $path);

        $pythonExec   = config('services.nutriscan.python_path', 'python');
        $pythonScript = base_path('services/python/predict_cli.py');

        $groqKey = env('GROQ_API_KEY', '');

        if (PHP_OS_FAMILY === 'Windows') {
            $process = Process::env([
                'SYSTEMROOT'  => getenv('SYSTEMROOT'),
                'PATH'        => getenv('PATH'),
                'TEMP'        => getenv('TEMP'),
                'TMP'         => getenv('TMP'),
                'USERNAME'    => getenv('USERNAME') ?: getenv('USER') ?: 'user',
                'USERPROFILE' => getenv('USERPROFILE') ?: getenv('HOME') ?: 'C:\\Users\\user',
                'HOMEPATH'    => getenv('HOMEPATH') ?: '\\Users\\user',
                'APPDATA'     => getenv('APPDATA') ?: getenv('TEMP'),
                'GROQ_API_KEY' => $groqKey,
            ])->run([$pythonExec, $pythonScript, $absolutePath]);
        } else {
            $process = Process::env([
                'HOME'         => getenv('HOME') ?: '/tmp',
                'USER'         => getenv('USER') ?: 'www-data',
                'PATH'         => getenv('PATH'),
                'GROQ_API_KEY' => $groqKey,
            ])->run([$pythonExec, $pythonScript, $absolutePath]);
        }

        if ($process->successful()) {
            $output = $process->output();
            \Illuminate\Support\Facades\Log::info('NutriScan Output: ' . $output);

            $aiData = json_decode($output, true);

            if ($aiData && !isset($aiData['error'])) {
                // Kuota hanya bertambah jika analisis benar-benar berhasil
                $quota->increment('scan_count');
                $aiData['image_url'] = Storage::url($path);
                return redirect()->route('nutriscan.index')->with('analysis', $aiData);
            }

            // Model mengembalikan error (misal: model load fail) — kuota tidak berkurang
            $errorMsg = $aiData['error'] ?? 'Gagal memproses analisis nutrisi.';
            \Illuminate\Support\Facades\Log::warning('NutriScan Model Error: ' . $errorMsg);
            Storage::disk('public')->delete($path);
            return redirect()->route('nutriscan.index')->with('error', $errorMsg);
        }

        // Sistem error (Python crash, path salah, dll) — kuota tidak berkurang
        $stderr = $process->errorOutput();
        \Illuminate\Support\Facades\Log::error('NutriScan Error: ' . $stderr);
        Storage::disk('public')->delete($path);

        // Tampilkan pesan lebih spesifik jika bisa dideteksi
        $errorMsg = 'Terjadi kesalahan sistem saat menjalankan analisis.';
        if (str_contains($stderr, 'ModuleNotFoundError')) {
            $errorMsg = 'Library Python belum lengkap. Hubungi administrator.';
        } elseif (str_contains($stderr, 'No such file or directory') || str_contains($stderr, 'cannot find')) {
            $errorMsg = 'Konfigurasi Python tidak ditemukan. Hubungi administrator.';
        }

        return redirect()->route('nutriscan.index')->with('error', $errorMsg);
    }

    public function storeLog(Request $request)
    {
        $data = $request->validate([
            'food_name' => 'required|string',
            'calories'  => 'required|integer',
            'protein'   => 'required|numeric',
            'carbs'     => 'required|numeric',
            'fat'       => 'required|numeric',
            'fiber'     => 'nullable|numeric',
            'sodium'    => 'nullable|numeric',
            'sugar'     => 'nullable|numeric',
            'image_url' => 'nullable|string',
            'portion'   => 'required|string',
            'meal_type' => 'sometimes|in:breakfast,lunch,dinner,snack',
        ]);

        $user   = auth()->user();
        $member = $user->familyMembers()->where('linked_user_id', $user->id)->first()
            ?? $user->familyMembers()->where('name', 'You')->first()
            ?? $user->familyMembers()->where('role', 'parent')->first()
            ?? $user->familyMembers()->first();

        if ($member) {
            $todayCalories = $member->foodLogs()->whereDate('eaten_at', now())->sum('calories');
            $newTotal      = $todayCalories + $data['calories'];
            $goal          = $member->daily_calorie_goal ?? 2000;

            if (!empty($data['image_url'])) {
                $relativePath = str_replace('/storage/', '', $data['image_url']);
                Storage::disk('public')->delete($relativePath);
            }

            $member->foodLogs()->create([
                'name'      => $data['food_name'],
                'calories'  => $data['calories'],
                'protein'   => $data['protein'],
                'carbs'     => $data['carbs'],
                'fat'       => $data['fat'],
                'fiber'     => $data['fiber'] ?? null,
                'sodium'    => $data['sodium'] ?? null,
                'sugar'     => $data['sugar'] ?? null,
                'meal_type' => $data['meal_type'] ?? 'lunch',
                'source'    => 'nutriscan',
                'eaten_at'  => now(),
            ]);

            $warning = null;
            if ($newTotal > $goal * 1.5) {
                $warning = 'Peringatan: Asupan kalori hari ini (' . $newTotal . ' kkal) sudah jauh melebihi target (' . $goal . ' kkal).';
            } elseif ($newTotal < 500 && now()->hour >= 18) {
                $warning = 'Peringatan: Asupan kalori hari ini sangat rendah (' . $newTotal . ' kkal). Pastikan kamu makan cukup.';
            }

            if ($warning) {
                return redirect()->route('dashboard')->with('success', 'Makanan berhasil dicatat!')->with('health_warning', $warning);
            }
        }

        return redirect()->route('dashboard')->with('success', 'Makanan berhasil dicatat!');
    }

    private function getTodayQuota($user): ScanQuota
    {
        return ScanQuota::firstOrCreate(
            ['user_id' => $user->id, 'scan_date' => now()->toDateString()],
            ['scan_count' => 0]
        );
    }
}
