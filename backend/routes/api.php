<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\StationController;
use App\Http\Controllers\Api\TrackController;

Route::get('/health', function () {
    return response()->json([
        'status' => 'online',
        'app' => 'Lofi Radio API',
        'timestamp' => now()->toIso8601String(),
    ]);
});

Route::prefix('stations')->group(function () {
    Route::get('/', [StationController::class, 'index']);
    Route::get('/{slug}', [StationController::class, 'show']);
});

Route::prefix('tracks')->group(function () {
    Route::get('/', [TrackController::class, 'index']);
    Route::get('/{id}', [TrackController::class, 'show']);
});