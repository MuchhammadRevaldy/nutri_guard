<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MealPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'family_member_id',
        'planned_date',
        'meal_type',
        'name',
        'calories',
        'protein',
        'carbs',
        'fat',
        'notes',
    ];

    protected $casts = [
        'planned_date' => 'date',
    ];

    public function familyMember()
    {
        return $this->belongsTo(FamilyMember::class);
    }
}
