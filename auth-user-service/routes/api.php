<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'auth-user-service',
        'timestamp' => now()->toIso8601String()
    ]);
});

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::post('/verify', [AuthController::class, 'verify'])->middleware('auth:sanctum');
});
