<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Process;

class NutriScanController extends Controller
{
    public function index()
    {
        return Inertia::render('NutriScan', [
            'analysis' => session('analysis'),
            'error' => session('error')
        ]);
    }

    public function analyze(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:10240', // Max 10MB
        ]);

        $path = $request->file('image')->store('nutriscan', 'public');
        $absolutePath = storage_path('app/public/' . $path);

        // ATTEMPT TO RUN REAL PYTHON ANALYZE
        $pythonExec = config('services.nutriscan.python_path', 'python');
        $pythonScript = base_path('services/python/predict_cli.py');

        // Pass system environment variables to the process (Windows safety)
        $process = Process::env([
            'SYSTEMROOT' => getenv('SYSTEMROOT'),
            'PATH' => getenv('PATH'),
            'TEMP' => getenv('TEMP'),
            'TMP' => getenv('TMP'),
        ])->run([$pythonExec, $pythonScript, $absolutePath]);

        if ($process->successful()) {
            $output = $process->output();
            $aiData = json_decode($output, true);

            if ($aiData && !isset($aiData['error'])) {
                $aiData['image_url'] = Storage::url($path);
                return redirect()->route('nutriscan.index')->with('analysis', $aiData);
            }
        }
    }
    
    public function storeLog(Request $request)
    {
        $data = $request->validate([
            'food_name' => 'required|string',
            'calories' => 'required|integer',
            'protein' => 'required|numeric',
            'carbs' => 'required|numeric',
            'fat' => 'required|numeric',
            'image_url' => 'nullable|string',
            'portion' => 'required|string',
        ]);

        // Find primary family member (assumes "You" / Parent is the target for now)
        $user = auth()->user();

        // Priority 1: Name "You" (Matches Dashboard default)
        $member = $user->familyMembers()->where('name', 'You')->first();

        // Priority 2: Role "Parent"
        if (!$member) {
            $member = $user->familyMembers()->where('role', 'parent')->first();
        }

        // Priority 3: First available member
        if (!$member) {
            $member = $user->familyMembers()->first();
        }

        if ($member) {
            $member->foodLogs()->create([
                'name' => $data['food_name'],
                'calories' => $data['calories'],
                'protein' => $data['protein'],
                'carbs' => $data['carbs'],
                'fat' => $data['fat'],
                'image_path' => $data['image_url'], // We use image_path to store the URL/path
                'eaten_at' => now(),
            ]);

            // Recalculate stats ? (If we had cached stats, needed. But dashboard calculates on fly usually)
        }

        return redirect()->route('dashboard')->with('success', 'Food logged successfully!');
    }
}
