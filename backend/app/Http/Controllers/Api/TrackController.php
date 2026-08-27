<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Track;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrackController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Track::with(['artist', 'station'])->where('is_active', true);

        if ($request->has('station_id')) {
            $query->where('station_id', $request->query('station_id'));
        }

        $tracks = $query->get();

        return response()->json([
            'success' => true,
            'data' => $tracks
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $track = Track::with(['artist', 'station'])
            ->where('is_active', true)
            ->find($id);

        if (!$track) {
            return response()->json([
                'success' => false,
                'message' => 'Faixa não encontrada.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $track
        ]);
    }
}