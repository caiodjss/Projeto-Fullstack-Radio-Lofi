<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Station;
use App\Models\RadioStationState;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class StationController extends Controller
{
    public function index(): JsonResponse
    {
        $stations = Station::with(['tracks' => function ($query) {
            $query->where('is_active', true)->with('artist')->orderBy('id');
        }])
        ->where('is_active', true)
        ->get();

        return response()->json([
            'success' => true,
            'data' => $stations
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $station = Station::with(['tracks' => function ($query) {
            $query->where('is_active', true)->with('artist')->orderBy('id');
        }])
        ->where('slug', $slug)
        ->where('is_active', true)
        ->first();

        if (!$station) {
            return response()->json([
                'success' => false,
                'message' => 'Estação não encontrada.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $station
        ]);
    }

    public function nowPlaying(string $slug): JsonResponse
    {
        $station = Station::with(['tracks' => function ($query) {
            $query->where('is_active', true)->with('artist')->orderBy('id');
        }])->where('slug', $slug)->where('is_active', true)->first();

        if (!$station) {
            return response()->json(['success' => false, 'message' => 'Estação não encontrada.'], 404);
        }

        $tracks = $station->tracks->filter(fn ($track) => $track->duration_seconds > 0)->values();
        if ($tracks->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'A estação não possui faixas válidas.'], 422);
        }

        $state = RadioStationState::firstOrCreate(
            ['station_id' => $station->id],
            ['cycle_started_at' => now()]
        );

        $totalDuration = $tracks->sum('duration_seconds');
        $elapsed = max(0, Carbon::parse($state->cycle_started_at)->diffInSeconds(now()));
        $cycleOffset = $elapsed % $totalDuration;
        $trackOffset = 0;
        $currentTrack = $tracks->first();

        foreach ($tracks as $track) {
            if ($cycleOffset < $trackOffset + $track->duration_seconds) {
                $currentTrack = $track;
                break;
            }
            $trackOffset += $track->duration_seconds;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'station' => $station,
                'track' => $currentTrack,
                'offset_seconds' => $cycleOffset - $trackOffset,
                'cycle_started_at' => $state->cycle_started_at,
            ],
        ]);
    }
}