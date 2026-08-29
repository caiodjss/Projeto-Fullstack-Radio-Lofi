<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlayHistory extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'track_id',
        'played_at',
    ];

    protected $casts = [
        'played_at' => 'datetime',
    ];

    public function track(): BelongsTo
    {
        return $this->belongsTo(Track::class);
    }
}
