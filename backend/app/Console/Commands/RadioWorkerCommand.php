<?php

namespace App\Console\Commands;

use App\Models\Station;
use App\Services\Radio\RadioPlaybackService;
use Illuminate\Console\Command;

class RadioWorkerCommand extends Command
{
    protected $signature = 'radio:worker {--interval=1 : Segundos entre cada tick da rádio}';

    protected $description = 'Mantém a rádio ativa e persiste o estado de reprodução em um processo contínuo.';

    public function __construct(protected RadioPlaybackService $radioPlaybackService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $interval = max(1, (int) $this->option('interval'));

        $this->info('Worker da rádio iniciado.');

        while (true) {
            try {
                $stations = Station::query()->where('is_active', true)->get();

                foreach ($stations as $station) {
                    $this->radioPlaybackService->tickStation($station);
                }

                $this->info(sprintf('Tick da rádio concluído em %s.', now()->toDateTimeString()));
            } catch (\Throwable $exception) {
                $this->error('Erro no worker da rádio: ' . $exception->getMessage());
                \Log::error('Erro no worker da rádio', [
                    'message' => $exception->getMessage(),
                    'trace' => $exception->getTraceAsString(),
                ]);
            }

            sleep($interval);
        }
    }
}
