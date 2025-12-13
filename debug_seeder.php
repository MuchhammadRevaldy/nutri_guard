<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\FamilyMember;
use App\Models\FoodLog;
use App\Models\GrowthLog;

try {
    $user = User::first();
    if (!$user) {
        $user = User::factory()->create();
    }

    $member = FamilyMember::where('user_id', $user->id)->first();
    if (!$member) {
        $member = FamilyMember::create([
            'user_id' => $user->id,
            'name' => 'Test',
            'role' => 'parent',
            'daily_calorie_goal' => 2000
        ]);
    }

    echo "Testing GrowthLog...\n";
    GrowthLog::create([
        'family_member_id' => $member->id,
        'height' => 170,
        'weight' => 70,
        'recorded_at' => now()
    ]);
    echo "GrowthLog Success.\n";

    echo "Testing FoodLog Tags...\n";
    FoodLog::create([
        'family_member_id' => $member->id,
        'name' => 'Test Food',
        'calories' => 100,
        'protein' => 10,
        'carbs' => 10,
        'fat' => 5,
        'eaten_at' => now(),
        'tags' => ['TestTag']
    ]);
    echo "FoodLog Success.\n";

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
