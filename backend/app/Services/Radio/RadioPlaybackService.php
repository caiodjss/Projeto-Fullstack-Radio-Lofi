<?php

namespace App\Services\Radio;

use App\Models\RadioStationState;
use App\Models\Station;
use App\Models\Track;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Collection;

class RadioPlaybackService
{
    public function resolveForStation(string $slug): array
    {
        $station = Station::query()
            ->with(['tracks' => fn ($query) => $query->where('is_active', true)->with('artist')->orderBy('id')])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (! $station) {
            throw new \RuntimeException('Estação não encontrada.');
        }

        $state = RadioStationState::query()
            ->with(['currentTrack.artist'])
            ->where('station_id', $station->id)
            ->first();

        if (! $state || $state->status !== 'playing' || ! $state->currentTrack) {
            throw new \RuntimeException('A estação ainda não possui estado de reprodução disponível.');
        }

        $queueIds = $state->queue ?? [];
        $queueTracks = $station->tracks
            ->filter(fn ($track) => in_array($track->id, $queueIds, true))
            ->values();
        $currentIndex = $queueTracks->search(fn ($track) => $track->id === $state->current_track_id);
        $nextTrack = $currentIndex !== false && $queueTracks->count() > 1
            ? $queueTracks->get(($currentIndex + 1) % $queueTracks->count())
            : null;

        return [
            'station' => $station,
            'track' => $state->currentTrack,
            'next_track' => $nextTrack,
            'offset_seconds' => (int) $state->playback_position_seconds,
            'cycle_started_at' => $state->cycle_started_at,
            'status' => $state->status,
            'last_heartbeat_at' => $state->last_heartbeat_at,
        ];
    }

    public function tickStation(Station $station): void
    {
        $lock = Cache::store('database')->lock('radio:worker:station:' . $station->id, 30);

        $lock->block(5, function () use ($station) {
            \DB::transaction(function () use ($station) {
                $tracks = $station->tracks()
                    ->where('is_active', true)
                    ->where('duration_seconds', '>', 0)
                    ->orderBy('id')
                    ->get();

                $state = RadioStationState::query()
                    ->where('station_id', $station->id)
                    ->lockForUpdate()
                    ->firstOrNew(['station_id' => $station->id]);

                if ($tracks->isEmpty()) {
                    $state->fill([
                        'current_track_id' => null,
                        'queue' => [],
                        'status' => 'stopped',
                        'playback_position_seconds' => 0,
                        'last_heartbeat_at' => now(),
                    ]);
                    $state->save();
                    return;
                }

                $queue = $this->reconcileQueue($state, $tracks);
                $orderedTracks = collect($queue)
                    ->map(fn (int $trackId) => $tracks->firstWhere('id', $trackId))
                    ->filter()
                    ->values();

                if (! $state->exists || ! $state->cycle_started_at || ! $state->current_track_id || ! $orderedTracks->contains('id', $state->current_track_id)) {
                    $state->cycle_started_at = now();
                    $state->current_track_id = $orderedTracks->first()->id;
                }

                $resolved = $this->resolveCurrentTrackFromCycle($state, $orderedTracks);
                $state->fill([
                    'current_track_id' => $resolved['track']->id,
                    'playback_position_seconds' => $resolved['offset_seconds'],
                    'cycle_started_at' => $resolved['cycle_started_at'],
                    'queue' => $queue,
                    'status' => 'playing',
                    'last_heartbeat_at' => now(),
                ]);
                $state->save();
            });
        });
    }

    protected function reconcileQueue(RadioStationState $state, Collection $tracks): array
    {
        $activeIds = $tracks->pluck('id')->all();
        $existingQueue = collect($state->queue ?? [])->filter(fn ($id) => in_array((int) $id, $activeIds, true));
        $newIds = collect($activeIds)->reject(fn ($id) => $existingQueue->contains($id));

        return $existingQueue->concat($newIds)->map(fn ($id) => (int) $id)->values()->all();
    }

    protected function resolveCurrentTrackFromCycle(RadioStationState $state, Collection $tracks): array
    {
        $queue = $state->queue ?? $tracks->pluck('id')->values()->all();

        if ($queue === []) {
            $queue = $tracks->pluck('id')->values()->all();
        }

        $cycleStartedAt = $state->cycle_started_at ?? now();
        $totalDuration = $tracks->sum('duration_seconds');

        if ($totalDuration <= 0) {
            $firstTrack = $tracks->first();

            return [
                'track' => $firstTrack,
                'offset_seconds' => 0,
                'cycle_started_at' => $cycleStartedAt,
            ];
        }

        $elapsed = max(0, $cycleStartedAt->diffInSeconds(now()));
        $cycleOffset = $elapsed % $totalDuration;
        $trackOffset = 0;
        $currentTrack = $tracks->first();

        foreach ($tracks as $track) {
            $nextOffset = $trackOffset + $track->duration_seconds;

            if ($cycleOffset < $nextOffset) {
                $currentTrack = $track;
                break;
            }

            $trackOffset = $nextOffset;
        }

        $offsetSeconds = max(0, $cycleOffset - $trackOffset);

        return [
            'track' => $currentTrack,
            'offset_seconds' => $offsetSeconds,
            'cycle_started_at' => $cycleStartedAt,
        ];
    }

    protected function normalizeQueue(RadioStationState $state, Collection $tracks): array
    {
        return $tracks->pluck('id')->values()->all();
    }
}

