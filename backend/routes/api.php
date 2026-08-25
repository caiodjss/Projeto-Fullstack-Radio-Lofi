<?php

use App\Http\Controllers\Api\StationController;
use App\Http\Controllers\Api\TrackController;
use Illuminate\Support\Facades\Route;

// Rota de verificação de integridade
Route::get('/health', function () {
    return response()->json([
        'status' => 'online',
        'app' => 'Lofi Radio API',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Endpoints públicos da Rádio
Route::get('/stations', [StationController::class, 'index']);
Route::get('/stations/{slug}', [StationController::class, 'show']);
Route::get('/tracks', [TrackController::class, 'index']);