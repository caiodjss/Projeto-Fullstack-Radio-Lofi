<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private array $legacySlugs = [
        'lo-fi-chill-8-bits',
        'vaporwave-nostalgia',
        'lo-fi-bossa-brasil',
        'midnight-rnb',
    ];

    private array $legacyNames = [
        'lo-fi chill & 8 bits',
        'vaporwave nostalgia',
        'lo-fi bossa & brasil',
        'midnight R&B',
    ];

    public function up(): void
    {
        DB::table('stations')
            ->where(function ($query) {
                $query->whereIn('slug', $this->legacySlugs)
                    ->orWhereIn('name', $this->legacyNames);
            })
            ->update(['is_active' => false]);
    }

    public function down(): void
    {
        DB::table('stations')
            ->where(function ($query) {
                $query->whereIn('slug', $this->legacySlugs)
                    ->orWhereIn('name', $this->legacyNames);
            })
            ->update(['is_active' => true]);
    }
};
