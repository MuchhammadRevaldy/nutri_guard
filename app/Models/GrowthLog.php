<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GrowthLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'family_member_id',
        'height',
        'weight',
        'recorded_at'
    ];

    protected $casts = [
        'recorded_at' => 'date',
        'height' => 'decimal:2',
        'weight' => 'decimal:2',
    ];

    public function familyMember()
    {
        return $this->belongsTo(FamilyMember::class);
    }
}
