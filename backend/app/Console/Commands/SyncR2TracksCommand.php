<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Station;
use App\Models\Artist;
use App\Models\Track;
use Illuminate\Support\Facades\Storage;
use getID3;

class SyncR2TracksCommand extends Command
{
    protected $signature = 'radio:sync-r2';
    protected $description = 'Varre os MP3s no Cloudflare R2, lê as tags ID3 e cadastra nas estações S4D e Nostalgic';

    public function handle(): int
    {
        $this->info('Iniciando sincronização com Cloudflare R2...');

        $cdnUrl = rtrim(env('CLOUDFLARE_R2_URL', ''), '/');

        // 1. Garantir que as 2 estações existam
        $stations = [
            'Sad' => Station::updateOrCreate(
                ['slug' => 's4d'],
                [
                    'name' => 'S4D',
                    'description' => 'Melancolia Lo-Fi, batidas lentas e reflexão para dias chuvosos.',
                    'theme_color' => '#60a5fa', // Azul sereno / melancólico
                    'background_url' => "{$cdnUrl}/backgrounds/Chico_8_Bits-ANIMATION.gif",
                    'is_active' => true,
                ]
            ),
            'Nostalgic' => Station::updateOrCreate(
                ['slug' => 'nostalgic'],
                [
                    'name' => 'Nostalgic',
                    'description' => 'Ecos do passado, sintetizadores retrô e memórias em 16-bit.',
                    'theme_color' => '#f472b6', // Rosa nostálgico
                    'background_url' => "{$cdnUrl}/backgrounds/Jorge_8_Bits-ANIMATION.gif",
                    'is_active' => true,
                ]
            ),
        ];

        // 2. Conectar ao disco R2 e listar arquivos de áudio
        $disk = Storage::disk('r2');
        $files = $disk->allFiles('audio');

        $getID3 = new getID3();

        foreach ($files as $file) {
            if (!str_ends_with(strtolower($file), '.mp3')) {
                continue;
            }

            $this->line("Processando: {$file}");

            // Baixa temporariamente para extração de metadados
            $tempPath = tempnam(sys_get_temp_dir(), 'id3_');
            file_put_contents($tempPath, $disk->get($file));

            $fileInfo = $getID3->analyze($tempPath);
            unlink($tempPath);

            // Extrair tags ID3 (com fallbacks)
            $title = $fileInfo['tags']['id3v2']['title'][0] 
                ?? $fileInfo['tags']['id3v1']['title'][0] 
                ?? pathinfo($file, PATHINFO_FILENAME);

            $artistName = $fileInfo['tags']['id3v2']['artist'][0] 
                ?? $fileInfo['tags']['id3v1']['artist'][0] 
                ?? 'Lo-Fi Artist';

            $genre = $fileInfo['tags']['id3v2']['genre'][0] 
                ?? $fileInfo['tags']['id3v1']['genre'][0] 
                ?? 'Sad';

            $duration = isset($fileInfo['playtime_seconds']) 
                ? (int) round($fileInfo['playtime_seconds']) 
                : 180;

            // Determina a estação pelo Gênero (Normaliza 'sad' -> 'Sad', 'nostalgic' -> 'Nostalgic')
            $targetStation = null;
            if (stripos($genre, 'nostalgic') !== false) {
                $targetStation = $stations['Nostalgic'];
            } else {
                $targetStation = $stations['Sad'];
            }

            // 3. Cadastrar ou atualizar Artista
            $artist = Artist::firstOrCreate(
                ['name' => trim($artistName)],
                [
                    'avatar_url' => 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80',
                    'social_link' => null,
                ]
            );

            // 4. Cadastrar ou atualizar Faixa
            $audioUrl = "{$cdnUrl}/" . ltrim($file, '/');

            Track::updateOrCreate(
                ['audio_url' => $audioUrl],
                [
                    'station_id' => $targetStation->id,
                    'artist_id' => $artist->id,
                    'title' => trim($title),
                    'duration_seconds' => $duration,
                    'is_active' => true,
                ]
            );

            $this->info("✔ [{$targetStation->name}] {$artist->name} - {$title} ({$duration}s)");
        }

        $this->info('Sincronização concluída com sucesso!');
        return Command::SUCCESS;
    }
}