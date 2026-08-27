<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Station;
use Illuminate\Http\JsonResponse;

class StationController extends Controller
{
    public function index(): JsonResponse
    {
        $stations = Station::with(['tracks' => function ($query) {
            $query->where('is_active', true)->with('artist');
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
            $query->where('is_active', true)->with('artist');
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
}