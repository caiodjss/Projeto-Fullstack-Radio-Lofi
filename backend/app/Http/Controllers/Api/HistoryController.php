<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlayHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HistoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $history = $request->user()
            ->playHistory()
            ->with('track.artist')
            ->latest('played_at')
            ->limit(50)
            ->get()
            ->map(fn (PlayHistory $entry) => [
                'id' => $entry->id,
                'played_at' => $entry->played_at,
                'track' => $entry->track,
            ]);

        return response()->json(['success' => true, 'data' => $history]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'track_id' => ['required', 'integer', 'exists:tracks,id'],
        ]);

        $entry = PlayHistory::create([
            'user_id' => $request->user()->id,
            'track_id' => $validated['track_id'],
        ]);

        return response()->json(['success' => true, 'data' => $entry], 201);
    }
}
