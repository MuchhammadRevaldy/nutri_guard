<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FamilyInvitation extends Model
{
    use HasFactory;

    protected $fillable = ['sender_id', 'recipient_email', 'status', 'token'];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
