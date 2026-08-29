<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private array $legacySlugs = [
        'lofi-chill',
        'vaporwave',
        'lofi-br',
        'midnight-rnb',
    ];

    private array $legacyNames = [
        'Lo-Fi Chill & 8-Bit',
        'Vaporwave Nostalgia',
        'Lo-Fi Bossa & Brasil',
        'Midnight R&B',
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
