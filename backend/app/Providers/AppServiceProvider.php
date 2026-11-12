<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\{Announcement, Category, DashboardSnapshot, HelpTicket, Page, SiteSetting, User};
use App\Observers\{AuditObserver, DocumentObserver};

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        JsonResource::withoutWrapping();

        Page::observe(DocumentObserver::class);
        Category::observe(DocumentObserver::class);
        foreach ([Announcement::class, User::class, SiteSetting::class, DashboardSnapshot::class, HelpTicket::class] as $model) {
            $model::observe(AuditObserver::class);
        }
    }
}
