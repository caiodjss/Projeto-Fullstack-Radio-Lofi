<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Station;
use App\Services\Radio\RadioPlaybackService;
use Illuminate\Http\JsonResponse;

class StationController extends Controller
{
    public function __construct(protected RadioPlaybackService $radioPlaybackService)
    {
    }

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

        if (! $station) {
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
        try {
            $data = $this->radioPlaybackService->resolveForStation($slug);

            return response()->json([
                'success' => true,
                'data' => [
                    'station' => $data['station'],
                    'track' => $data['track'],
                    'next_track' => $data['next_track'],
                    'offset_seconds' => $data['offset_seconds'],
                    'cycle_started_at' => $data['cycle_started_at'],
                    'status' => $data['status'],
                    'last_heartbeat_at' => $data['last_heartbeat_at'],
                ],
            ]);
        } catch (\RuntimeException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
            ], 422);
        }
    }
}