<?php

namespace App\Console\Commands;

use App\Models\Artist;
use App\Models\Station;
use App\Models\Track;
use Exception;
use getID3;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class SyncR2TracksCommand extends Command
{
    protected $signature = 'radio:sync-r2 {--batch-size=25 : Quantidade de arquivos por lote para processar antes de reconectar ao banco}';

    protected $description = 'Varre os MP3s no Cloudflare R2, lê as tags ID3 e cadastra nas estações S4D e Nostalgic';

    public function handle(): int
    {
        $this->info('Iniciando sincronização com Cloudflare R2...');

        try {
            $this->ensureDatabaseConnection();

            $cdnUrl = rtrim(env('CLOUDFLARE_R2_URL', ''), '/');
            $stations = $this->ensureStations($cdnUrl);

            $disk = Storage::disk('r2');
            $files = array_values(array_filter(
                $disk->allFiles('audios'),
                fn ($file) => str_ends_with(strtolower((string) $file), '.mp3')
            ));

            $this->info('Arquivos MP3 encontrados: ' . count($files));

            if ($files === []) {
                throw new \RuntimeException(
                    'Nenhum MP3 encontrado no prefixo audios/. Verifique CLOUDFLARE_R2_ENDPOINT, '
                    . 'CLOUDFLARE_R2_BUCKET e as credenciais do R2.'
                );
            }

            $batchSize = max(1, (int) $this->option('batch-size'));
            $batches = array_chunk($files, $batchSize);

            foreach ($batches as $index => $batch) {
                $this->info(sprintf('Processando lote %d/%d', $index + 1, count($batches)));
                $this->ensureDatabaseConnection();

                foreach ($batch as $file) {
                    try {
                        $this->syncTrackFile($file, $stations, $cdnUrl, $disk);
                    } catch (Exception $e) {
                        $this->warn("Falha ao processar {$file}: {$e->getMessage()}");
                    }
                }
            }

            $this->info('Sincronização concluída com sucesso!');

            return Command::SUCCESS;
        } catch (Exception $e) {
            $this->error('Erro ao sincronizar arquivos de R2: ' . $e->getMessage());

            return Command::FAILURE;
        }
    }

    protected function ensureDatabaseConnection(): void
    {
        try {
            DB::connection()->getPdo();
        } catch (Exception $e) {
            DB::disconnect();
            DB::reconnect();
        }

        if (DB::connection()->getPdo() === null) {
            DB::reconnect();
        }
    }

    protected function ensureStations(string $cdnUrl): array
    {
        return [
            'Sad' => Station::updateOrCreate(
                ['slug' => 's4d'],
                [
                    'name' => 'S4D',
                    'description' => 'Melancolia Lo-Fi, batidas lentas e reflexão para dias chuvosos.',
                    'theme_color' => '#60a5fa',
                    'background_url' => "{$cdnUrl}/backgrounds/Chico_8_Bits-ANIMATION.gif",
                    'is_active' => true,
                ]
            ),
            'Nostalgic' => Station::updateOrCreate(
                ['slug' => 'nostalgic'],
                [
                    'name' => 'Nostalgic',
                    'description' => 'Ecos do passado, sintetizadores retrô e memórias em 16-bit.',
                    'theme_color' => '#f472b6',
                    'background_url' => "{$cdnUrl}/backgrounds/Jorge_8_Bits-ANIMATION.gif",
                    'is_active' => true,
                ]
            ),
        ];
    }

    protected function syncTrackFile(string $file, array $stations, string $cdnUrl, $disk): void
    {
        $this->line("Processando: {$file}");

        $tempPath = tempnam(sys_get_temp_dir(), 'id3_');
        if ($tempPath === false) {
            throw new \RuntimeException("Não foi possível criar o arquivo temporário para {$file}.");
        }

        try {
            $content = $disk->get($file);
            if ($content === null || $content === false || $content === '') {
                throw new \RuntimeException("Conteúdo vazio ou indisponível para {$file}.");
            }

            $written = file_put_contents($tempPath, $content);
            if ($written === false) {
                throw new \RuntimeException("Não foi possível salvar o arquivo temporário para {$file}.");
            }

            $getID3 = new getID3();
            $fileInfo = $getID3->analyze($tempPath);

            $title = $fileInfo['tags']['id3v2']['title'][0]
                ?? $fileInfo['tags']['id3v1']['title'][0]
                ?? pathinfo($file, PATHINFO_FILENAME);

            $artistName = $fileInfo['tags']['id3v2']['artist'][0]
                ?? $fileInfo['tags']['id3v1']['artist'][0]
                ?? 'Lo-Fi Artist';

            $rawGenre = $fileInfo['tags']['id3v2']['genre'][0]
                ?? $fileInfo['tags']['id3v1']['genre'][0]
                ?? 'Sad';

            $duration = isset($fileInfo['playtime_seconds'])
                ? (int) round($fileInfo['playtime_seconds'])
                : 180;

            $genre = stripos((string) $rawGenre, 'nostalgic') !== false ? 'Nostalgic' : 'Sad';
            $targetStation = $stations[$genre];

            $this->ensureDatabaseConnection();

            $artist = Artist::firstOrCreate(
                ['name' => trim((string) $artistName)],
                [
                    'avatar_url' => 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80',
                    'social_link' => null,
                ]
            );

            $encodedPath = implode('/', array_map(
                static fn (string $segment): string => rawurlencode($segment),
                explode('/', ltrim($file, '/'))
            ));
            $audioUrl = "{$cdnUrl}/{$encodedPath}";

            Track::updateOrCreate(
                ['audio_url' => $audioUrl],
                [
                    'station_id' => $targetStation->id,
                    'artist_id' => $artist->id,
                    'title' => trim((string) $title),
                    'genre' => $genre,
                    'duration_seconds' => $duration,
                    'is_active' => true,
                ]
            );

            $this->info("✔ [{$targetStation->name}] [{$genre}] {$artist->name} - {$title} ({$duration}s)");
        } finally {
            if (is_file($tempPath)) {
                unlink($tempPath);
            }
        }
    }
}
