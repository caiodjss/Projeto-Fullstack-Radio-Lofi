<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Track extends Model
{
    use HasFactory;

    protected $fillable = [
        'station_id',
        'artist_id',
        'title',
        'genre', // <-- Adicionado ao $fillable
        'duration_seconds',
        'audio_url',
        'is_active',
    ];

    protected $casts = [
        'duration_seconds' => 'integer',
        'is_active' => 'boolean',
    ];

    public function station(): BelongsTo
    {
        return $this->belongsTo(Station::class);
    }

    public function artist(): BelongsTo
    {
        return $this->belongsTo(Artist::class);
    }
}