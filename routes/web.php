<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    $user = auth()->user();

    // 1. Family Members
    $familyMembers = $user->familyMembers;

    // 2. Focused Member (Default to "You" or first)
    $myself = $familyMembers->where('name', 'You')->first();

    // Redirect to setup if "You" profile is incomplete
    if (!$myself || !$myself->weight || !$myself->height) {
        return redirect()->route('profile.setup');
    }

    // 2. Focused Member (Default to "You" or first)
    // For MVP, simply getting "You" logs or the first user's logs
    $myself = $familyMembers->where('name', 'You')->first() ?? $familyMembers->first();

    // 3. Today's Logs
    $todaysLogs = \App\Models\FoodLog::where('family_member_id', $myself?->id)
        ->whereDate('eaten_at', now()->today())
        ->orderBy('eaten_at', 'desc')
        ->get();

    // 4. Calculate Daily Stats
    $dailyStats = [
        'calories' => $todaysLogs->sum('calories'),
        'protein' => $todaysLogs->sum('protein'),
        'carbs' => $todaysLogs->sum('carbs'),
        'fat' => $todaysLogs->sum('fat'),
        'goal_calories' => $myself?->daily_calorie_goal ?? 2000,
    ];

    // 5. Weekly Chart Data (Last 7 Days)
    $weeklyChartData = [
        'labels' => [],
        'data' => []
    ];

    // Iterate last 7 days including today
    for ($i = 6; $i >= 0; $i--) {
        $date = now()->subDays($i);
        $dayLabel = $date->format('D'); // Mon, Tue...
        $weeklyChartData['labels'][] = $dayLabel; // Pushing to array

        $dayCalories = \App\Models\FoodLog::where('family_member_id', $myself?->id)
            ->whereDate('eaten_at', $date)
            ->sum('calories');
        $weeklyChartData['data'][] = $dayCalories;
    }

    return Inertia::render('Dashboard', [
        'familyMembers' => $familyMembers,
        'todaysLogs' => $todaysLogs,
        'dailyStats' => $dailyStats,
        'weeklyChartData' => $weeklyChartData,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/report', function () {
    $user = auth()->user();
    $myself = $user->familyMembers->where('name', 'You')->first();

    // 1. Weekly Data (Mon-Sun)
    // We assume the report is for the "current week" of the logs or last 7 days.
    // Let's grab last 7 days to be dynamic.
    $endDate = now();
    $startDate = now()->subDays(6);

    $logs = \App\Models\FoodLog::where('family_member_id', $myself?->id)
        ->whereDate('eaten_at', '>=', $startDate)
        ->whereDate('eaten_at', '<=', $endDate)
        ->orderBy('eaten_at', 'desc')
        ->get();

    // 2. Average Stats
    $daysCount = 7;
    $totalCalories = $logs->sum('calories');
    $avgCalories = round($totalCalories / $daysCount);

    // 3. Daily Breakdown
    // Group logs by Date
    $dailyBreakdown = [];
    $dailyGoal = $myself?->daily_calorie_goal ?? 2000;

    for ($i = 0; $i < 7; $i++) {
        $date = $startDate->copy()->addDays($i);
        $dateStr = $date->toDateString();
        $displayDate = $date->format('l'); // Monday, Tuesday...

        $dayLogs = $logs->filter(function ($log) use ($dateStr) {
            return \Carbon\Carbon::parse($log->eaten_at)->toDateString() === $dateStr;
        });

        $dayTotalCal = $dayLogs->sum('calories');
        $dayTotalProtein = $dayLogs->sum('protein');
        $dayTotalCarbs = $dayLogs->sum('carbs');
        $dayTotalFat = $dayLogs->sum('fat');

        $dailyBreakdown[] = [
            'date' => $displayDate,
            'full_date' => $date->format('M j'),
            'total_calories' => $dayTotalCal,
            'target_calories' => $dailyGoal,
            'macros' => [
                'protein' => $dayTotalProtein,
                'carbs' => $dayTotalCarbs,
                'fat' => $dayTotalFat,
            ],
            'meals' => $dayLogs->values() // Detailed items
        ];
    }

    // 4. Insights (Mock logic based on data)
    // "Great job! You met your protein goal on X out of 7 days"
    $proteinGoal = 50; // Mock goal
    $daysMetProtein = collect($dailyBreakdown)->where('macros.protein', '>=', $proteinGoal)->count();

    // 5. Top Foods
    $topFoods = $logs->groupBy('name')->map(function ($row) {
        return $row->count();
    })->sortDesc()->take(5);

    return Inertia::render('Report', [
        'weekRange' => $startDate->format('M j') . ' - ' . $endDate->format('M j'),
        'avgCalories' => $avgCalories,
        'dailyBreakdown' => $dailyBreakdown,
        'insights' => [
            'daysMetProtein' => $daysMetProtein,
            'totalDays' => 7
        ],
        'topFoods' => $topFoods
    ]);
})->middleware(['auth', 'verified'])->name('report');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::post('/family/invite', [\App\Http\Controllers\FamilyController::class, 'invite'])->name('family.invite');
    Route::get('/family/accept/{token}', [\App\Http\Controllers\FamilyController::class, 'accept'])->name('family.accept');
    Route::patch('/family/{id}', [\App\Http\Controllers\FamilyController::class, 'update'])->name('family.update');
    Route::delete('/family/{id}', [\App\Http\Controllers\FamilyController::class, 'destroy'])->name('family.destroy');

    // NutriScan AI
    Route::get('/nutriscan', [\App\Http\Controllers\NutriScanController::class, 'index'])->name('nutriscan.index');
    Route::post('/nutriscan/analyze', [\App\Http\Controllers\NutriScanController::class, 'analyze'])->name('nutriscan.analyze');
    Route::post('/nutriscan/log', [\App\Http\Controllers\NutriScanController::class, 'storeLog'])->name('nutriscan.log');

    // FitChef AI
    Route::get('/fitchef', [\App\Http\Controllers\FitChefController::class, 'index'])->name('fitchef.index');
    Route::post('/fitchef/generate', [\App\Http\Controllers\FitChefController::class, 'generate'])->name('fitchef.generate');

    Route::get('/meal-planner', function () {
        return Inertia::render('MealPlanner');
    })->name('meal-planner');

    // Gemini Thinking Demo
    Route::get('/coba-deploy', function () {
        return Inertia::render('CobaDeploy');
    })->name('coba-deploy');

    Route::post('/coba-deploy/chat', [\App\Http\Controllers\TryDeployController::class, 'chat'])->name('coba-deploy.chat');


    // Onboarding / Setup Profile
    Route::get('/setup-profile', function () {
        return Inertia::render('SetupProfile');
    })->name('profile.setup');

    Route::post('/setup-profile', function (\Illuminate\Http\Request $request) {
        $request->validate([
            'gender' => 'required|in:male,female',
            'birth_date' => 'required|date',
            'weight' => 'required|numeric|min:1',
            'height' => 'required|numeric|min:1',
            'activity_level' => 'required|in:sedentary,light,moderate,active,very_active',
            'health_goal' => 'required|in:loss,maintenance,gain,growth',
        ]);

        $user = auth()->user();
        // Find or create the "You" member
        $member = $user->familyMembers()->where('name', 'You')->first();

        if (!$member) {
            $member = $user->familyMembers()->create([
                'name' => 'You',
                'role' => 'parent', // default
                'linked_user_id' => $user->id,
                'daily_calorie_goal' => 2000 // temp
            ]);
        }

        $member->fill($request->all());
        $member->recalculateCalories();

        return redirect()->route('dashboard');

    })->name('profile.setup.store');
});

require __DIR__ . '/auth.php';
