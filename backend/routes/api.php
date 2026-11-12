<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\ImportController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\LikeController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\HelpTicketController;
use App\Http\Controllers\Api\SiteSettingController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\AuditLogController;

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:20,1');

// Publik: konten portal
Route::get('/public-stats', [StatsController::class, 'publicStats']);
Route::get('/announcements', [AnnouncementController::class, 'index']);
Route::get('/announcements/{announcement}', [AnnouncementController::class, 'show']);
Route::get('/dashboard', [DashboardController::class, 'show']);
Route::get('/dashboard/periods', [DashboardController::class, 'periods']);
Route::get('/settings', [SiteSettingController::class, 'index']);
Route::post('/help-tickets', [HelpTicketController::class, 'store'])->middleware('throttle:10,1');

Route::get('/search', [SearchController::class, 'index']);

Route::get('/categories', [CategoryController::class, 'index']);

Route::get('/pages', [PageController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/stats', [StatsController::class, 'index']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/me', [AuthController::class, 'updateProfile']);
    Route::put('/me/password', [AuthController::class, 'updatePassword']);

    Route::get('/me/likes', [LikeController::class, 'index']);
    // Isi dokumen hanya untuk pengguna yang sudah login
    Route::get('/documents/latest', [DocumentController::class, 'latest']);
    Route::get('/categories/{category}', [CategoryController::class, 'show']);
    Route::get('/pages/{page}', [PageController::class, 'show']);
    Route::get('/pages/{page}/pdf', [DocumentController::class, 'pagePdf'])->middleware('throttle:30,1');
    Route::get('/categories/{category}/pdf', [DocumentController::class, 'categoryPdf'])->middleware('throttle:30,1');
    Route::get('/categories/{category}/like', [LikeController::class, 'categoryStatus']);
    Route::post('/categories/{category}/like', [LikeController::class, 'categoryStore']);
    Route::delete('/categories/{category}/like', [LikeController::class, 'categoryDestroy']);
    Route::post('/pages/{page}/like', [LikeController::class, 'store']);
    Route::delete('/pages/{page}/like', [LikeController::class, 'destroy']);

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

    // Pengumuman, dashboard, dan konten statis dikelola admin & editor
    Route::middleware('permission:manage-pages')->group(function () {
        Route::post('/announcements', [AnnouncementController::class, 'store']);
        Route::put('/announcements/{announcement}', [AnnouncementController::class, 'update']);
        Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy']);

        Route::put('/dashboard/{period}', [DashboardController::class, 'upsert']);
        Route::delete('/dashboard/{period}', [DashboardController::class, 'destroy']);

        Route::put('/settings/{key}', [SiteSettingController::class, 'update']);
        Route::delete('/settings/{key}', [SiteSettingController::class, 'destroy']);
    });

    // Khusus admin
    Route::middleware('permission:manage-users')->group(function () {
        Route::get('/audit-logs', [AuditLogController::class, 'index']);
        Route::get('/document-versions', [DocumentController::class, 'versions']);
        Route::apiResource('users', UserController::class);
        Route::post('/users/{user}/approve', [UserController::class, 'approve']);
        Route::post('/users/{user}/reject', [UserController::class, 'reject']);

        Route::get('/help-tickets', [HelpTicketController::class, 'index']);
        Route::get('/help-tickets/{ticket}/attachment', [HelpTicketController::class, 'attachment']);
        Route::put('/help-tickets/{ticket}', [HelpTicketController::class, 'update']);
        Route::delete('/help-tickets/{ticket}', [HelpTicketController::class, 'destroy']);
    });

});