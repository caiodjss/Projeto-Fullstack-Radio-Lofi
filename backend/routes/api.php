<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\HistoryController;
use App\Http\Controllers\Api\StationController;
use App\Http\Controllers\Api\TrackController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'online',
        'app' => 'Lofi Radio API',
        'timestamp' => now()->toIso8601String(),
    ]);
});

Route::middleware('web')->prefix('auth')->group(function () {
    Route::get('/google', [AuthController::class, 'redirectToGoogle']);
    Route::get('/google/callback', [AuthController::class, 'handleGoogleCallback']);
});

Route::prefix('stations')->group(function () {
    Route::get('/', [StationController::class, 'index']);
    Route::get('/{slug}/now-playing', [StationController::class, 'nowPlaying']);
    Route::get('/{slug}', [StationController::class, 'show']);
});

Route::prefix('tracks')->group(function () {
    Route::get('/', [TrackController::class, 'index']);
    Route::get('/{id}', [TrackController::class, 'show']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/toggle/{track}', [FavoriteController::class, 'toggle']);
    Route::get('/history', [HistoryController::class, 'index']);
    Route::post('/history', [HistoryController::class, 'store']);
});