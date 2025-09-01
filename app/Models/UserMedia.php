<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserMedia extends Model
{
    use HasFactory;

    protected $table = 'user_media';

    protected $fillable = [
        'user_id',
        'media_type',
        'url',
        'public_id',
        'format',
        'position',
    ];

    // Relación con usuario
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
}
