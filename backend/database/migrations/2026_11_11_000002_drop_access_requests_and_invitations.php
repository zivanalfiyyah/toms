<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Fitur permintaan akses & undangan diganti persetujuan akun langsung oleh admin.
    public function up(): void
    {
        Schema::dropIfExists('invitations');
        Schema::dropIfExists('access_requests');
    }

    public function down(): void
    {
        // Tabel lama tidak dipulihkan.
    }
};
