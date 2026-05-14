<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Recipe extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'calories',
        'protein',
        'carbs',
        'fat',
        'fiber',
        'preparation_time',
        'cooking_time',
        'servings',
        'difficulty',
        'source',
        'image',
        'ingredients',
        'steps',
    ];

    protected $casts = [
        'ingredients' => 'array',
        'steps' => 'array',
    ];
}
