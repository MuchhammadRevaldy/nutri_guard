<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FamilyMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'linked_user_id',
        'name',
        'role',
        'gender',
        'birth_date',
        'weight',
        'height',
        'activity_level',
        'health_goal',
        'daily_calorie_goal'
    ];

    protected $casts = [
        'birth_date' => 'date',
        'weight' => 'decimal:2',
        'height' => 'decimal:2',
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

    /**
     * Alias for logs, used in Controllers
     */
    public function foodLogs()
    {
        return $this->hasMany(FoodLog::class);
    }

    protected $appends = ['age_category'];

    /**
     * Get the age category based on birth date.
     */
    public function getAgeCategoryAttribute()
    {
        if (!$this->birth_date) {
            return null;
        }

        $age = $this->birth_date->age;

        if ($age < 13) {
            return 'Child';
        } elseif ($age <= 19) {
            return 'Teenager';
        } else {
            return 'Mature';
        }
    }

    /**
     * Calculate and update the daily calorie goal based on physical attributes.
     */
    public function recalculateCalories()
    {
        if (!$this->weight || !$this->height || !$this->birth_date || !$this->gender) {
            return; // Cannot calculate without data
        }

        $age = $this->birth_date->age;

        // 1. Calculate BMR (Mifflin-St Jeor Equation)
        $bmr = (10 * $this->weight) + (6.25 * $this->height) - (5 * $age);

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
