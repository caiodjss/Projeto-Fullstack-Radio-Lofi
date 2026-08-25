<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Track;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrackController extends Controller
{
    /**
     * Listar faixas ativas, opcionalmente filtradas por station_id.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Track::where('is_active', true)->with('artist', 'station');

        if ($request->has('station_id')) {
            $query->where('station_id', $request->query('station_id'));
        }

        return response()->json($query->get());
    }
}