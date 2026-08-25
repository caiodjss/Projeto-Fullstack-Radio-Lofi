<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Station;
use Illuminate\Http\JsonResponse;

class StationController extends Controller
{
    /**
     * Listar todas as estações ativas com suas faixas e respectivos artistas.
     */
    public function index(): JsonResponse
    {
        $stations = Station::where('is_active', true)
            ->with(['tracks' => function ($query) {
                $query->where('is_active', true)->with('artist');
            }])
            ->get();

        return response()->json($stations);
    }

    /**
     * Exibir os dados e faixas de uma estação específica pelo slug.
     */
    public function show(string $slug): JsonResponse
    {
        $station = Station::where('slug', $slug)
            ->where('is_active', true)
            ->with(['tracks' => function ($query) {
                $query->where('is_active', true)->with('artist');
            }])
            ->firstOrFail();

        return response()->json($station);
    }
}