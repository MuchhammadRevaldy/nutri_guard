<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Process;

class NutriScanController extends Controller
{
    const MAX_SCANS_PER_DAY = 20;

    public function index()
    {
        $user = auth()->user();
        $this->resetScanCountIfNeeded($user);

        return Inertia::render('NutriScan', [
            'analysis'       => session('analysis'),
            'error'          => session('error'),
            'scansUsed'      => $user->scan_count_today,
            'scansRemaining' => max(0, self::MAX_SCANS_PER_DAY - $user->scan_count_today),
            'maxScans'       => self::MAX_SCANS_PER_DAY,
        ]);
    }

    public function analyze(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png|max:5120', // 5MB max, jpg/jpeg/png only
        ]);

        $user = auth()->user();
        $this->resetScanCountIfNeeded($user);

        if ($user->scan_count_today >= self::MAX_SCANS_PER_DAY) {
            return redirect()->route('nutriscan.index')
                ->with('error', 'Batas scan harian (' . self::MAX_SCANS_PER_DAY . 'x) sudah tercapai. Coba lagi besok.');
        }

        // Store temporarily (not permanently per privacy constraint)
        $path         = $request->file('image')->store('nutriscan', 'public');
        $absolutePath = storage_path('app/public/' . $path);

        $pythonExec   = config('services.nutriscan.python_path', 'python');
        $pythonScript = base_path('services/python/predict_cli.py');

        if (PHP_OS_FAMILY === 'Windows') {
            $process = Process::env([
                'SYSTEMROOT' => getenv('SYSTEMROOT'),
                'PATH'       => getenv('PATH'),
                'TEMP'       => getenv('TEMP'),
                'TMP'        => getenv('TMP'),
            ])->run([$pythonExec, $pythonScript, $absolutePath]);
        } else {
            $process = Process::run([$pythonExec, $pythonScript, $absolutePath]);
        }

        // Increment scan count regardless of result
        $user->increment('scan_count_today');
        $user->scan_date = now()->toDateString();
        $user->save();

        if ($process->successful()) {
            $output = $process->output();
            \Illuminate\Support\Facades\Log::info('NutriScan Output: ' . $output);

            $aiData = json_decode($output, true);

            if ($aiData && !isset($aiData['error'])) {
                $aiData['image_url'] = Storage::url($path);
                return redirect()->route('nutriscan.index')->with('analysis', $aiData);
            }

            $errorMsg = $aiData['error'] ?? 'Gagal memproses analisis nutrisi.';
            return redirect()->route('nutriscan.index')->with('error', $errorMsg);
        }

        $errorOutput = $process->errorOutput();
        \Illuminate\Support\Facades\Log::error('NutriScan Error: ' . $errorOutput);

        // Delete temp image after processing (privacy compliance)
        Storage::disk('public')->delete($path);

        return redirect()->route('nutriscan.index')->with('error', 'Terjadi kesalahan sistem saat menjalankan analisis.');
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
            // Health risk check: calorie extremes
            $todayCalories = $member->foodLogs()->whereDate('eaten_at', now())->sum('calories');
            $newTotal      = $todayCalories + $data['calories'];
            $goal          = $member->daily_calorie_goal ?? 2000;

            // Delete temp image immediately after logging (privacy constraint)
            if (!empty($data['image_url'])) {
                $relativePath = str_replace('/storage/', '', $data['image_url']);
                Storage::disk('public')->delete($relativePath);
            }

            $member->foodLogs()->create([
                'name'       => $data['food_name'],
                'calories'   => $data['calories'],
                'protein'    => $data['protein'],
                'carbs'      => $data['carbs'],
                'fat'        => $data['fat'],
                'fiber'      => $data['fiber'] ?? null,
                'sodium'     => $data['sodium'] ?? null,
                'sugar'      => $data['sugar'] ?? null,
                'meal_type'  => $data['meal_type'] ?? 'lunch',
                'image_path' => null, // Not stored permanently
                'eaten_at'   => now(),
            ]);

            // Health risk warning for extreme calorie intake
            $warning = null;
            if ($newTotal > $goal * 1.5) {
                $warning = 'Peringatan: Asupan kalori hari ini (' . $newTotal . ' kkal) sudah jauh melebihi target (' . $goal . ' kkal). Perhatikan porsi makanmu.';
            } elseif ($newTotal < 500 && now()->hour >= 18) {
                $warning = 'Peringatan: Asupan kalori hari ini sangat rendah (' . $newTotal . ' kkal). Pastikan kamu makan cukup.';
            }

            if ($warning) {
                return redirect()->route('dashboard')->with('success', 'Makanan berhasil dicatat!')->with('health_warning', $warning);
            }
        }

        return redirect()->route('dashboard')->with('success', 'Makanan berhasil dicatat!');
    }

    private function resetScanCountIfNeeded($user): void
    {
        $today = now()->toDateString();
        if ($user->scan_date !== $today) {
            $user->scan_count_today = 0;
            $user->scan_date        = $today;
            $user->save();
        }
    }
}
