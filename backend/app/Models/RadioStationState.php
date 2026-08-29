<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RadioStationState extends Model
{
    protected $fillable = [
        'station_id',
        'cycle_started_at',
    ];

    protected $casts = [
        'cycle_started_at' => 'datetime',
    ];

    public function station(): BelongsTo
    {
        return $this->belongsTo(Station::class);
    }
}
