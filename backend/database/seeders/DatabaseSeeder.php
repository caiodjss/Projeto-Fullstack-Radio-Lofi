<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Os dados de rádio são sincronizados diretamente do Cloudflare R2.
        // $this->call([
        //     RadioSeeder::class,
        // ]);
    }
}
