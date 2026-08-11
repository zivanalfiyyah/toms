<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\ImportController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\UserController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/search', [SearchController::class, 'index']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

Route::get('/pages', [PageController::class, 'index']);
Route::get('/pages/{page}', [PageController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

Route::middleware('permission:manage-categories')->group(function () {
        Route::post('/categories', [CategoryController::class, 'store']);

        Route::post('/categories/import', [ImportController::class, 'storeCategory']);
        Route::put('/categories/{category}/import', [ImportController::class, 'updateCategory']);
        
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
    });

    Route::middleware('permission:manage-pages')->group(function () {
        Route::post('/pages', [PageController::class, 'store']);
        Route::post('/pages/upload-image', [PageController::class, 'uploadImage']);
        
        Route::post('/pages/import', [ImportController::class, 'store']);
        Route::put('/pages/{page}/import', [ImportController::class, 'update']);
        
        Route::put('/pages/{page}', [PageController::class, 'update']);
        Route::delete('/pages/{page}', [PageController::class, 'destroy']);
    });

    Route::middleware('permission:manage-users')->group(function () {
        Route::apiResource('users', UserController::class);
    });

});