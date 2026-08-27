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
Route::post('/stations', [StationController::class, 'store']);

Route::get('/tracks', [TrackController::class, 'index']);
Route::post('/tracks', [TrackController::class, 'store']);
Route::delete('/tracks/{id}', [TrackController::class, 'destroy']);