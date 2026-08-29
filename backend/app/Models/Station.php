<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Station extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'theme_color',
        'background_url',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function tracks(): HasMany
    {
        return $this->hasMany(Track::class);
    }

    public function radioState(): HasOne
    {
        return $this->hasOne(RadioStationState::class);
    }
}