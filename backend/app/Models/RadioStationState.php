<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RadioStationState extends Model
{
    protected $fillable = [
        'station_id',
        'current_track_id',
        'queue',
        'status',
        'cycle_started_at',
        'playback_position_seconds',
        'last_heartbeat_at',
    ];

    protected $casts = [
        'cycle_started_at' => 'datetime',
        'last_heartbeat_at' => 'datetime',
        'queue' => 'array',
    ];

    public function station(): BelongsTo
    {
        return $this->belongsTo(Station::class);
    }

    public function currentTrack(): BelongsTo
    {
        return $this->belongsTo(Track::class, 'current_track_id');
    }
}
