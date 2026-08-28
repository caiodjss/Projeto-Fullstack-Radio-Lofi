<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use App\Models\Track;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $favorites = $request->user()
            ->favorites()
            ->with('track.artist')
            ->get()
            ->pluck('track')
            ->filter()
            ->values();

        return response()->json([
            'success' => true,
            'data' => $favorites,
        ]);
    }

    public function toggle(Request $request, Track $track): JsonResponse
    {
        $favorite = Favorite::query()
            ->where('user_id', $request->user()->id)
            ->where('track_id', $track->id)
            ->first();

        if ($favorite) {
            $favorite->delete();

            return response()->json([
                'success' => true,
                'data' => [
                    'track_id' => $track->id,
                    'is_favorited' => false,
                ],
            ]);
        }

        Favorite::query()->create([
            'user_id' => $request->user()->id,
            'track_id' => $track->id,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'track_id' => $track->id,
                'is_favorited' => true,
            ],
        ]);
    }
}
