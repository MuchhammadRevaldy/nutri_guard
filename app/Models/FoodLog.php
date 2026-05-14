<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FoodLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'family_member_id',
        'name',
        'calories',
        'protein',
        'carbs',
        'fat',
        'image_path',
        'eaten_at',
        'tags'
    ];

    protected $casts = [
        'tags' => 'array',
        'eaten_at' => 'datetime'
    ];

    public function familyMember()
    {
        return $this->belongsTo(FamilyMember::class);
    }
}
