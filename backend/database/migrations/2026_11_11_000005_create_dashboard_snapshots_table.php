<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Satu baris = satu periode (mis. 2026-06). Isi dashboard disimpan sebagai JSON:
        // kpis, trend, fleet, safety, actions.
        Schema::create('dashboard_snapshots', function (Blueprint $table) {
            $table->id();
            $table->string('period', 7)->unique();
            $table->json('data');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dashboard_snapshots');
    }
};
