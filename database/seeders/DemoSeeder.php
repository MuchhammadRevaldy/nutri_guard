<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\FamilyMember;
use App\Models\FoodLog;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // Create 5 Demo Users
        for ($i = 1; $i <= 5; $i++) {
            $user = User::firstOrCreate(
                ['email' => "demo$i@example.com"],
                [
                    'name' => "Demo User $i",
                    'password' => Hash::make('password'),
                ]
            );

            // Random Physical Attributes
            $gender = rand(0, 1) ? 'male' : 'female';
            $age = rand(20, 50);
            $birthDate = Carbon::now()->subYears($age)->subDays(rand(1, 365));
            $weight = rand(50, 90);
            $height = rand(150, 185);

            // Create/Update "Self" FamilyMember
            $familyMember = FamilyMember::updateOrCreate(
                ['user_id' => $user->id, 'name' => 'You'],
                [
                    'linked_user_id' => $user->id,
                    'role' => 'parent',
                    'gender' => $gender,
                    'birth_date' => $birthDate,
                    'weight' => $weight,
                    'height' => $height,
                    'activity_level' => 'moderate',
                    'health_goal' => 'maintenance',
                    'daily_calorie_goal' => rand(1800, 2500)
                ]
            );

            // Growth Logs (History)
            // 1. Current
            \App\Models\GrowthLog::create([
                'family_member_id' => $familyMember->id,
                'height' => $height,
                'weight' => $weight,
                'recorded_at' => Carbon::today()
            ]);

            // 2. Last Month (Simulate changes for alerts)
            $oldHeight = (rand(0, 1)) ? $height : $height - 0.5; // Chance of stagnation
            $oldWeight = (rand(0, 2) === 0) ? $weight + 1.5 : $weight - 0.5; // Chance of weight loss

            \App\Models\GrowthLog::create([
                'family_member_id' => $familyMember->id,
                'height' => $oldHeight,
                'weight' => $oldWeight,
                'recorded_at' => Carbon::today()->subDays(30)
            ]);

            // 3. Weekly Food Logs
            $this->createWeeklyLogs($familyMember);
        }
    }

    private function createWeeklyLogs($member)
    {
        $foods = [
            // High Protein & Iron
            ['name' => 'Nasi Goreng Spesial', 'cal' => 450, 'prot' => 20, 'carb' => 50, 'fat' => 15, 'tags' => ['Animal Protein', 'High Iron']],
            ['name' => 'Ayam Bakar', 'cal' => 300, 'prot' => 25, 'carb' => 5, 'fat' => 20, 'tags' => ['Animal Protein']],
            ['name' => 'Sate Hati Ayam', 'cal' => 200, 'prot' => 18, 'carb' => 5, 'fat' => 10, 'tags' => ['Animal Protein', 'High Iron', 'Iron Boost']],
            ['name' => 'Rendang Daging', 'cal' => 500, 'prot' => 30, 'carb' => 10, 'fat' => 35, 'tags' => ['Animal Protein', 'High Iron']],

            // Moderate/Low
            ['name' => 'Gado-gado', 'cal' => 250, 'prot' => 10, 'carb' => 30, 'fat' => 10, 'tags' => ['High Fiber']],
            ['name' => 'Bubur Ayam', 'cal' => 280, 'prot' => 15, 'carb' => 40, 'fat' => 8, 'tags' => ['Animal Protein']],
            ['name' => 'Pisang Goreng', 'cal' => 150, 'prot' => 1, 'carb' => 25, 'fat' => 5, 'tags' => []],
            ['name' => 'Es Teh Manis', 'cal' => 90, 'prot' => 0, 'carb' => 22, 'fat' => 0, 'tags' => []],
            ['name' => 'Sayur Asem', 'cal' => 120, 'prot' => 5, 'carb' => 15, 'fat' => 2, 'tags' => ['High Fiber']],
            ['name' => 'Tahu Tempe Goreng', 'cal' => 180, 'prot' => 12, 'carb' => 10, 'fat' => 12, 'tags' => ['Plant Protein']],
        ];

        // Loop for the past 7 days (including today)
        for ($day = 0; $day < 7; $day++) {
            $date = Carbon::today()->subDays($day);

            // Add 3-4 random meals per day
            $dailyMeals = rand(3, 4);

            for ($k = 0; $k < $dailyMeals; $k++) {
                $food = $foods[array_rand($foods)];

                // Random time: 07:00 to 20:00
                $hour = rand(7, 20);
                $eatenAt = $date->copy()->setTime($hour, rand(0, 59));

                FoodLog::create([
                    'family_member_id' => $member->id,
                    'name' => $food['name'],
                    'calories' => $food['cal'],
                    'protein' => $food['prot'],
                    'carbs' => $food['carb'],
                    'fat' => $food['fat'],
                    'tags' => $food['tags'], // Now supported
                    'eaten_at' => $eatenAt,
                ]);
            }
        }
    }
}
