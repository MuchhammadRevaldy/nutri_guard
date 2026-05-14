<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FamilyMember extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'linked_user_id',
        'name',
        'role',
        'gender',
        'birth_date',
        'activity_level',
        'health_goal',
        'daily_calorie_goal',
        'allergies',
        'avatar_url',
        'avatar_source',
        'avatar_provider',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'allergies'  => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function linkedUser()
    {
        return $this->belongsTo(User::class, 'linked_user_id');
    }

    public function logs()
    {
        return $this->hasMany(FoodLog::class);
    }

    public function foodLogs()
    {
        return $this->hasMany(FoodLog::class);
    }

    public function growthLogs()
    {
        return $this->hasMany(GrowthLog::class);
    }

    protected $appends = ['age_category', 'display_avatar'];

    public function getDisplayAvatarAttribute()
    {
        if ($this->avatar_url) return $this->avatar_url;
        if ($this->linkedUser && $this->linkedUser->avatar_url) return $this->linkedUser->avatar_url;
        return null;
    }

    /**
     * Get the age category based on birth date.
     */
    public function getAgeCategoryAttribute()
    {
        if ($this->birth_date) {
            $age = $this->birth_date->age;
        } elseif ($this->linked_user_id) {
            // Fallback: Check if the linked user has a profile with a birth_date
            $linkedMember = FamilyMember::where('user_id', $this->linked_user_id)
                ->whereNotNull('birth_date')
                ->first();

            if ($linkedMember) {
                $age = $linkedMember->birth_date->age;
            } else {
                return null;
            }
        } else {
            return null;
        }

        // Specific User Request Logic:
        // 13-19 = Teenager
        // 20-40 = Adult

        if ($age < 13) {
            return 'Child';
        } elseif ($age <= 19) {
            return 'Teenager';
        } elseif ($age <= 40) {
            return 'Adult';
        } else {
            return 'Senior'; // Fallback for > 40
        }
    }

    /**
     * Calculate and update the daily calorie goal based on physical attributes.
     */
    public function recalculateCalories()
    {
        $latestGrowth = $this->growthLogs()->latest('recorded_at')->first();

        if (!$latestGrowth || !$latestGrowth->weight || !$latestGrowth->height || !$this->birth_date || !$this->gender) {
            return;
        }

        $weight = $latestGrowth->weight;
        $height = $latestGrowth->height;
        $age    = $this->birth_date->age;

        // 1. Calculate BMR (Mifflin-St Jeor Equation)
        $bmr = (10 * $weight) + (6.25 * $height) - (5 * $age);

        if ($this->gender === 'male') {
            $bmr += 5;
        } else {
            $bmr -= 161;
        }

        // 2. TDEE Multiplier
        $multipliers = [
            'sedentary' => 1.2,
            'light' => 1.375,
            'moderate' => 1.55,
            'active' => 1.725,
            'very_active' => 1.9,
        ];

        $tdee = $bmr * ($multipliers[$this->activity_level] ?? 1.2);

        // 3. Goal Adjustment
        $adjustment = 0;

        // Automatic goal for children (< 18)
        if ($age < 18) {
            $adjustment = 300; // Surplus
            $this->health_goal = 'growth'; // Force set goal
        } else {
            switch ($this->health_goal) {
                case 'loss':
                    $adjustment = -500;
                    break;
                case 'gain':
                    $adjustment = 500;
                    break;
                case 'growth':
                    $adjustment = 200;
                    break;
                case 'maintenance':
                default:
                    $adjustment = 0;
                    break;
            }
        }

        $this->daily_calorie_goal = round($tdee + $adjustment);
        $this->save();
    }
}
