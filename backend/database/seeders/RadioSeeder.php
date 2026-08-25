<?php

namespace Database\Seeders;

use App\Models\Artist;
use App\Models\Station;
use App\Models\Track;
use Illuminate\Database\Seeder;

class RadioSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Criar Artistas
        $artist1 = Artist::create([
            'name' => 'Lucas Lazari',
            'avatar_url' => 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80',
            'social_link' => 'https://soundcloud.com',
        ]);

        $artist2 = Artist::create([
            'name' => 'Neon Dreams',
            'avatar_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            'social_link' => 'https://spotify.com',
        ]);

        $artist3 = Artist::create([
            'name' => 'Silva & Bossa',
            'avatar_url' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
            'social_link' => 'https://instagram.com',
        ]);

        $artist4 = Artist::create([
            'name' => 'Velvet Moon',
            'avatar_url' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            'social_link' => 'https://youtube.com',
        ]);

        // 2. Criar Estações Temáticas
        $stationLofi = Station::create([
            'name' => 'Lo-Fi Chill & 8-Bit',
            'slug' => 'lofi-chill',
            'description' => 'Aventuras em pixel art, tons alegres e batidas nostálgicas para foco e energia.',
            'theme_color' => '#38bdf8', // Ciano Claro / Sky Blue vibrante de 8-bit
            'background_url' => 'http://localhost:8000/backgrounds/Chico_8_Bits-ANIMATION.gif',
            'is_active' => true,
        ]);

        $stationVaporwave = Station::create([
            'name' => 'Vaporwave Nostalgia',
            'slug' => 'vaporwave',
            'description' => 'Sintetizadores retrô, estética anos 80 e ecos do futuro analógico.',
            'theme_color' => '#ec4899',
            'background_url' => 'http://localhost:8000/backgrounds/Jorge_8_Bits-ANIMATION.gif', // Usando seu 2º GIF
            'is_active' => true,
        ]);

        $stationBossa = Station::create([
            'name' => 'Lo-Fi Bossa & Brasil',
            'slug' => 'lofi-br',
            'description' => 'A suavidade do violão brasileiro fundida com grooves lo-fi contemporâneos.',
            'theme_color' => '#10b981',
            'background_url' => 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1920&auto=format&fit=crop&q=80',
            'is_active' => true,
        ]);

        $stationRnb = Station::create([
            'name' => 'Midnight R&B',
            'slug' => 'midnight-rnb',
            'description' => 'Batidas intimistas e melódicas perfeitas para as madrugadas.',
            'theme_color' => '#3b82f6',
            'background_url' => 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&auto=format&fit=crop&q=80',
            'is_active' => true,
        ]);

        // 3. Faixas da Estação Lo-Fi Chill & 8-Bit (Arquivos locais em public/audio)
        Track::create([
            'station_id' => $stationLofi->id,
            'artist_id' => $artist1->id,
            'title' => 'New Wings',
            'audio_url' => 'http://localhost:8000/audio/Lucas%20Lazari%20-%20New%20Wings.mp3',
            'duration_seconds' => 148,
            'is_active' => true,
        ]);

        Track::create([
            'station_id' => $stationLofi->id,
            'artist_id' => $artist1->id,
            'title' => 'Cat Naps',
            'audio_url' => 'http://localhost:8000/audio/us%20-%20cat%20naps.mp3',
            'duration_seconds' => 125,
            'is_active' => true,
        ]);

        // Estação: Vaporwave
        Track::create([
            'station_id' => $stationVaporwave->id,
            'artist_id' => $artist2->id,
            'title' => 'Arcade 1989',
            'audio_url' => 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
            'duration_seconds' => 345,
            'is_active' => true,
        ]);

        Track::create([
            'station_id' => $stationVaporwave->id,
            'artist_id' => $artist2->id,
            'title' => 'Neon Highway Cruise',
            'audio_url' => 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
            'duration_seconds' => 302,
            'is_active' => true,
        ]);

        // Estação: Lo-Fi Bossa
        Track::create([
            'station_id' => $stationBossa->id,
            'artist_id' => $artist3->id,
            'title' => 'Brisa de Ipanema',
            'audio_url' => 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
            'duration_seconds' => 350,
            'is_active' => true,
        ]);

        // Estação: Midnight R&B
        Track::create([
            'station_id' => $stationRnb->id,
            'artist_id' => $artist4->id,
            'title' => 'City Lights After Dark',
            'audio_url' => 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
            'duration_seconds' => 280,
            'is_active' => true,
        ]);
    }
}