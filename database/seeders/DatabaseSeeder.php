<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\FamilyMember;
use App\Models\FoodLog;
use App\Models\Recipe;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create a Test User
        $user = User::factory()->create([
            'name' => 'Sandy User',
            'email' => 'sandy@example.com',
            'password' => bcrypt('password'),
        ]);

        // 2. Create Family Members (Based on Screenshot 1)
        $members = [
            ['name' => 'You', 'role' => 'parent', 'goal' => 2000],
            ['name' => 'Jane D.', 'role' => 'parent', 'goal' => 1800],
            ['name' => 'Mike D.', 'role' => 'child', 'goal' => 1500],
            ['name' => 'Baby D.', 'role' => 'child', 'goal' => 1000],
        ];

        foreach ($members as $data) {
            FamilyMember::create([
                'user_id' => $user->id,
                'name' => $data['name'],
                'role' => $data['role'],
                'daily_calorie_goal' => $data['goal'],
            ]);
        }

        $me = FamilyMember::where('name', 'You')->first();

        // 3. Create Food Logs (Based on Screenshot 2 & 3 - Today's Log)
        $today = now();

        FoodLog::create([
            'family_member_id' => $me->id,
            'name' => 'Oatmeal',
            'calories' => 250,
            'protein' => 10,
            'carbs' => 45,
            'fat' => 5,
            'eaten_at' => $today->copy()->setTime(8, 0),
        ]);

        FoodLog::create([
            'family_member_id' => $me->id,
            'name' => 'Apple',
            'calories' => 95,
            'protein' => 0.5,
            'carbs' => 25,
            'fat' => 0.3,
            'eaten_at' => $today->copy()->setTime(10, 0),
        ]);

        FoodLog::create([
            'family_member_id' => $me->id,
            'name' => 'Grilled Chicken Salad',
            'calories' => 450,
            'protein' => 40,
            'carbs' => 15,
            'fat' => 20,
            'eaten_at' => $today->copy()->setTime(13, 0),
        ]);

        // 4. Create Seed Data for Weekly Report (Previous Days)
        // Mon (Today is assumed Mon for this batch, let's backfill last week)
        $startOfWeek = now()->startOfWeek();

        // Random bulk data for charts
        for ($i = 0; $i < 7; $i++) {
            $date = $startOfWeek->copy()->addDays($i);
            // Just generic logs to fill charts
            FoodLog::create([
                'family_member_id' => $me->id,
                'name' => 'Daily Meal',
                'calories' => rand(1500, 2200),
                'protein' => rand(60, 100),
                'carbs' => rand(150, 250),
                'fat' => rand(40, 80),
                'eaten_at' => $date,
            ]);
        }

        // 5. Create Recipes (Example Recommendation)
        Recipe::create([
            'name' => 'Grilled Chicken Salad',
            'description' => 'A healthy mix of fresh greens, tomatoes, and grilled chicken breast.',
            'calories' => 450,
            'protein' => 40,
            'image_path' => 'chicken_salad.jpg'
        ]);

        Recipe::create([
            'name' => 'Quinoa Bowl',
            'description' => 'High protein vegetarian option.',
            'calories' => 380,
            'protein' => 12,
            'image_path' => 'quinoa.jpg'
        ]);
    }
}
